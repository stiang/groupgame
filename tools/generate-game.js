#!/usr/bin/env node
/**
 * Game Generator
 *
 * Usage:
 *   node generate-game.js [numGroups] [itemsPerGroup]
 *
 * Examples:
 *   node generate-game.js 5 5      # Small 5x5 game
 *   node generate-game.js 10 10    # Medium 10x10 game
 *   node generate-game.js 45 45    # Original full game
 *
 * This script:
 * 1. Validates that enough categories exist
 * 2. Generates a new config.js with your settings
 * 3. Outputs which categories will be used
 */

const fs = require('fs');
const path = require('path');

// Parse args
const numGroups = parseInt(process.argv[2]) || 45;
const itemsPerGroup = parseInt(process.argv[3]) || 45;

console.log(`Generating game: ${numGroups} groups of ${itemsPerGroup} items`);
console.log(`Total items: ${numGroups * itemsPerGroup}`);
console.log(`Win score: ${numGroups * (itemsPerGroup - 1)}`);
console.log('');

// Load categories properly
const categoriesPath = path.join(__dirname, '..', 'src', 'categories.js');
const categoriesContent = fs.readFileSync(categoriesPath, 'utf8');

// Extract and evaluate the CATEGORIES object
const match = categoriesContent.match(/const CATEGORIES = ({[\s\S]*?});/);
if (!match) {
  console.error('ERROR: Could not parse CATEGORIES from categories.js');
  process.exit(1);
}

let CATEGORIES;
try {
  CATEGORIES = eval('(' + match[1] + ')');
} catch (e) {
  console.error('ERROR: Failed to evaluate CATEGORIES:', e.message);
  process.exit(1);
}

const categories = Object.entries(CATEGORIES).map(([name, items]) => ({
  name,
  count: items.length
}));

console.log(`Found ${categories.length} categories`);

// Check if we have enough
const validCategories = categories.filter(c => c.count >= itemsPerGroup);
console.log(`Categories with ${itemsPerGroup}+ items: ${validCategories.length}`);

if (validCategories.length < numGroups) {
  console.error(`\nERROR: Need ${numGroups} categories with at least ${itemsPerGroup} items each.`);
  console.error(`Only ${validCategories.length} categories qualify.`);

  const shortCategories = categories.filter(c => c.count < itemsPerGroup);
  if (shortCategories.length > 0) {
    console.error('\nCategories that are too short:');
    shortCategories.forEach(c => console.error(`  ${c.name}: ${c.count} items`));
  }
  process.exit(1);
}

console.log('\nCategories that will be used:');
for (let i = 0; i < numGroups; i++) {
  console.log(`  ${i + 1}. ${validCategories[i].name} (${validCategories[i].count} items)`);
}

// Generate new config
const configContent = `// Game configuration
// Adjust these to create different game variants

const CONFIG = {
  // Number of groups to form (also the board dimension)
  numGroups: ${numGroups},

  // Items per group (must match numGroups for the math to work)
  itemsPerGroup: ${itemsPerGroup},

  // Derived: total cells on board
  get boardSize() {
    return this.numGroups * this.itemsPerGroup;
  },

  // Win condition: (numGroups - 1) * itemsPerGroup merges needed
  // (each merge reduces total items by 1, we go from N*M items to N items)
  get winScore() {
    return this.numGroups * (this.itemsPerGroup - 1);
  }
};

// Freeze to prevent accidental modification during gameplay
Object.freeze(CONFIG);
`;

const configPath = path.join(__dirname, '..', 'src', 'config.js');
fs.writeFileSync(configPath, configContent);

console.log(`\nWrote config to: ${configPath}`);
console.log('Open src/index.html to play!');
