// Board rendering and manipulation

const Board = {
  table: null,

  create() {
    const board = document.getElementById('board');
    this.table = document.createElement('table');
    this.table.id = 'the_table';

    for (let i = 0; i < CONFIG.numGroups; i++) {
      const tr = document.createElement('tr');

      for (let j = 0; j < CONFIG.numGroups; j++) {
        const td = document.createElement('td');
        const button = document.createElement('button');

        // Track original position for save/restore
        button.dataset.row = i;
        button.dataset.col = j;
        button.onclick = () => Game.select(button);

        td.appendChild(button);
        tr.appendChild(td);
      }

      this.table.appendChild(tr);
    }

    board.appendChild(this.table);
  },

  populateFromWordlist(wordlist) {
    let idx = 0;
    const rows = this.table.rows;

    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].cells;
      for (let j = 0; j < cells.length; j++) {
        const button = cells[j].firstElementChild;
        const item = wordlist[idx++];

        button.textContent = item.word;
        button.dataset.category = item.category;
        button.dataset.cluster = JSON.stringify([item.word]);
      }
    }
  },

  finishCategory(button) {
    const category = button.dataset.category;
    button.innerHTML = '<b>' + category + '</b>';
    button.disabled = true;
    button.style.background = this.categoryColor(category);
    button.style.color = '#ffffff';
    button.style.borderColor = 'transparent';
    button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
  },

  categoryColor(str) {
    // Generate consistent muted color from string (works well in dark mode)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash) % 360;
    const s = 45 + (Math.abs(hash) % 20); // 45-65% saturation
    const l = 35 + (Math.abs(hash) % 15); // 35-50% lightness (darker, muted tones)

    return `hsl(${h}, ${s}%, ${l}%)`;
  },

  serialize() {
    // Save cells by their original (row, col) position
    const data = {};
    const rows = this.table.rows;

    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].cells;
      for (let j = 0; j < cells.length; j++) {
        const button = cells[j].firstElementChild;
        const key = `${button.dataset.row}_${button.dataset.col}`;
        data[key] = {
          category: button.dataset.category,
          cluster: button.dataset.cluster,
          innerHTML: button.innerHTML,
          title: button.title,
          disabled: button.disabled,
          background: button.style.background
        };
      }
    }

    return data;
  },

  deserialize(data) {
    const rows = this.table.rows;
    const cellsToRemove = [];

    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].cells;
      // Iterate backwards since we may remove cells
      for (let j = cells.length - 1; j >= 0; j--) {
        const button = cells[j].firstElementChild;
        const key = `${button.dataset.row}_${button.dataset.col}`;

        if (data[key]) {
          // Restore this cell
          const cellData = data[key];
          button.dataset.category = cellData.category;
          button.dataset.cluster = cellData.cluster;
          button.innerHTML = cellData.innerHTML;
          button.title = cellData.title || '';
          button.disabled = cellData.disabled;
          if (cellData.background) {
            button.style.background = cellData.background;
          }
        } else {
          // This cell was removed in the saved state
          cellsToRemove.push(cells[j]);
        }
      }
    }

    // Remove cells that don't exist in saved state
    cellsToRemove.forEach(cell => cell.remove());
  }
};
