// Game state and logic

const Game = {
  // State
  score: 0,
  mistakes: 0,
  selected: null,
  wordlist: [], // Array of {word, category} objects

  // Initialize game
  init() {
    this.validateSetup();
    this.buildWordlist();
    this.shuffleWordlist();
    Board.create();
    this.loadState() || Board.populateFromWordlist(this.wordlist);
    this.updateDisplay();
  },

  validateSetup() {
    // Check we have enough valid categories
    const validCategories = Object.entries(CATEGORIES)
      .filter(([name, items]) => items.length >= CONFIG.itemsPerGroup);

    if (validCategories.length < CONFIG.numGroups) {
      alert(`Need ${CONFIG.numGroups} categories with at least ${CONFIG.itemsPerGroup} items each. Only ${validCategories.length} qualify.`);
      throw new Error('Not enough valid categories');
    }
  },

  buildWordlist() {
    this.wordlist = [];

    // Get categories that have enough items
    const validCategories = Object.entries(CATEGORIES)
      .filter(([name, items]) => items.length >= CONFIG.itemsPerGroup);

    // Shuffle and pick numGroups categories
    this.shuffle(validCategories);
    const selectedCategories = validCategories.slice(0, CONFIG.numGroups);

    // From each category, pick random items
    for (const [catName, items] of selectedCategories) {
      // Shuffle items and take itemsPerGroup
      const shuffledItems = [...items];
      this.shuffle(shuffledItems);

      for (let j = 0; j < CONFIG.itemsPerGroup; j++) {
        this.wordlist.push({
          word: shuffledItems[j],
          category: catName
        });
      }
    }
  },

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  },

  shuffleWordlist() {
    this.shuffle(this.wordlist);
  },

  // Selection handling
  select(button) {
    if (button.disabled) return;

    // Clicking already selected button deselects it
    if (this.selected === button) {
      this.deselect();
      return;
    }

    // First selection
    if (!this.selected) {
      this.selected = button;
      button.classList.add('selected');
      document.getElementById('deselect').disabled = false;
      return;
    }

    // Second selection - attempt merge
    this.attemptMerge(this.selected, button);
  },

  deselect() {
    if (this.selected) {
      this.selected.classList.remove('selected');
      this.selected = null;
      document.getElementById('deselect').disabled = true;
    }
  },

  attemptMerge(first, second) {
    document.getElementById('deselect').disabled = true;

    if (first.dataset.category === second.dataset.category) {
      this.mergeSuccess(first, second);
    } else {
      this.mergeFail(first, second);
    }

    this.selected = null;
    first.classList.remove('selected');
    this.saveState();

    if (this.score === CONFIG.winScore) {
      this.win();
    }
  },

  mergeSuccess(first, second) {
    this.score++;

    // Merge into the LAST clicked (second), remove the FIRST clicked
    // This lets the player control where groups end up
    const cluster1 = JSON.parse(first.dataset.cluster);
    const cluster2 = JSON.parse(second.dataset.cluster);
    const merged = cluster2.concat(cluster1);

    second.dataset.cluster = JSON.stringify(merged);

    // Update display on the surviving button (second)
    if (merged.length === 2) {
      second.innerHTML = '<b>' + merged.join('; ') + '</b>';
    } else {
      second.innerHTML = '<b>' + merged.slice(0, 2).join(', ') +
        ', ... <span class="red">[' + merged.length + ']</span></b>';
      second.title = merged.join('\n');
    }

    // Check if category complete
    if (merged.length === CONFIG.itemsPerGroup) {
      Board.finishCategory(second);
    }

    // Remove first clicked button
    first.parentElement.remove();
    this.updateDisplay();
  },

  mergeFail(first, second) {
    this.mistakes++;

    // Shake animation
    first.classList.add('shake');
    second.classList.add('shake');

    const cleanup = (btn) => {
      btn.addEventListener('animationend', () => {
        btn.classList.remove('shake', 'selected');
      }, { once: true });
    };

    cleanup(first);
    cleanup(second);

    this.updateDisplay();
  },

  updateDisplay() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('mistakes').textContent = this.mistakes;
  },

  // Persistence
  saveState() {
    const state = {
      score: this.score,
      mistakes: this.mistakes,
      board: Board.serialize(),
      // Store config to detect mismatches
      config: {
        numGroups: CONFIG.numGroups,
        itemsPerGroup: CONFIG.itemsPerGroup
      }
    };
    localStorage.setItem('groupgame', JSON.stringify(state));
  },

  loadState() {
    const saved = localStorage.getItem('groupgame');
    if (!saved) return false;

    try {
      const state = JSON.parse(saved);

      // Check if saved state matches current config
      if (!state.config ||
          state.config.numGroups !== CONFIG.numGroups ||
          state.config.itemsPerGroup !== CONFIG.itemsPerGroup) {
        console.log('Config changed, starting fresh game');
        this.clearState();
        return false;
      }

      this.score = state.score;
      this.mistakes = state.mistakes;
      Board.deserialize(state.board);

      // Restart fireworks if game was already won
      if (this.score === CONFIG.winScore) {
        Effects.startFireworks();
      }

      return true;
    } catch (e) {
      console.error('Failed to load state:', e);
      return false;
    }
  },

  clearState() {
    localStorage.removeItem('groupgame');
  },

  newGame() {
    if (confirm('Start a new game? Current progress will be lost.')) {
      this.clearState();
      location.reload();
    }
  },

  changeSize(size) {
    const newSize = parseInt(size);
    if (newSize !== CONFIG.numGroups) {
      if (this.score > 0) {
        if (!confirm('Change size? Current progress will be lost.')) {
          // Reset dropdown to current size
          document.getElementById('gameSize').value = CONFIG.numGroups;
          return;
        }
      }
      this.clearState();
      CONFIG.setSize(newSize);
      location.reload();
    }
  },

  // Win condition
  win() {
    Effects.startFireworks();
  }
};
