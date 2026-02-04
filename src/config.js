// Game configuration
// Size can be changed via UI, stored in localStorage

const CONFIG = {
  // Read size from localStorage, default to 5
  get numGroups() {
    return parseInt(localStorage.getItem('groupgame_size')) || 5;
  },

  get itemsPerGroup() {
    return this.numGroups; // Keep square for now
  },

  get boardSize() {
    return this.numGroups * this.itemsPerGroup;
  },

  get winScore() {
    return this.numGroups * (this.itemsPerGroup - 1);
  },

  setSize(n) {
    localStorage.setItem('groupgame_size', n);
  }
};
