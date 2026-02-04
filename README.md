# Group Game

A browser-based grouping game where you combine items from the same category until you form complete groups.

Based on [Thomas Colthurst's 2025.html](https://thomaswc.com/2025.html), released under CC BY-SA 4.0.

## How to Play

1. Open `src/index.html` in a browser
2. Click an item to select it
3. Click another item - if they're from the same category, they merge
4. Keep merging until you form complete groups
5. Wrong guesses count as mistakes but don't end the game

## Project Structure

```
src/
├── index.html      # Main HTML file
├── style.css       # Styles
├── config.js       # Game settings (groups, items per group)
├── categories.js   # All category data
├── game.js         # Core game logic
├── board.js        # Board rendering
└── effects.js      # Visual effects (fireworks)

tools/
└── generate-game.js  # Helper to create different game sizes
```

## Customizing the Game

### Quick Settings Change

Edit `src/config.js` to change:
- `numGroups`: How many categories/groups (also determines board width)
- `itemsPerGroup`: How many items in each category

Note: Both values should be equal for the board math to work (N×N grid).

### Using the Generator

```bash
# Small game (5 groups of 5)
node tools/generate-game.js 5 5

# Medium game (10 groups of 10)
node tools/generate-game.js 10 10

# Full original game (45 groups of 45)
node tools/generate-game.js 45 45
```

The generator validates that enough categories exist and updates `config.js`.

### Adding New Categories

Edit `src/categories.js` and add your category to the `CATEGORIES` object:

```javascript
"My Category": ["Item1", "Item2", "Item3", ...]
```

Each category needs at least as many items as `CONFIG.itemsPerGroup`.

## Game Mechanics

- The board is an N×N grid where N = numGroups = itemsPerGroup
- Each cell contains one item from one category
- Merging two items from the same category combines their clusters
- A cluster of N items becomes a completed category
- Win condition: All items merged into complete categories
- Progress is saved to localStorage

## Credits

Original game by Thomas Colthurst, 2025.
Released under Creative Commons Share Alike with Attribution (CC BY-SA 4.0).
# groupgame
