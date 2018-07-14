import Cell from "./cell.js";

/**
 * A board containing all of the cells for a Game of Life.
 */
export default class Board {
  /**
   * A map from coordinates to cells that may change in the next step and must be simulated. Cells
   * in the map can be either alive or dead.
   *
   * @type {Map<string, Cell>}
   */
  _activeCells = new Map();

  /**
   * A map from coordinates to cells that cannot change in the next step and should be ignored in
   * the simulation. Cells in the map must be alive.
   *
   * @type {Map<string, Cell>}
   */
  _stableCells = new Map();

  /**
   * Returns the cell at the given row and column.
   *
   * @param {number} row - The row number of the cell.
   * @param {number} column - The column number of the cell.
   * @return {Cell} The cell at the given row and column.
   */
  get(row, column) {
    const key = keyFromCoordinates(row, column);
    if (this._activeCells.has(key)) {
      return this._activeCells.get(key);
    } else if (this._stableCells.has(key)) {
      return this._stableCells.get(key);
    } else {
      return new Cell(row, column, false);
    }
  }

  /**
   * Sets the state of the cell at the given row and column.
   *
   * @param {number} row - The row number of the cell.
   * @param {number} column - The column number of the cell.
   * @param {boolean} alive - True if the cell is alive, false otherwise.
   */
  set(row, column, alive) {
    // Update and activate the cell if the new state is different.
    if (alive !== this.get(row, column).alive) {
      const key = keyFromCoordinates(row, column);
      const cell = new Cell(row, column, alive);
      this._activeCells.set(key, cell);
      this._stableCells.delete(key);

      // Activate the cell's neighbors.
      for (const neighbor of this._neighbors(cell)) {
        this._activeCells.set(keyFromCell(neighbor), neighbor);
        this._stableCells.delete(keyFromCell(neighbor));
      }
    }
  }

  /**
   * Adds the given pattern to the board.
   *
   * @param {Pattern} pattern - The pattern to add to the board.
   */
  add(pattern) {
    for (const cell of pattern) {
      if (cell.alive) {
        this.set(cell.row, cell.column, true);
      }
    }
  }

  /**
   * Removes all live cells from the board.
   */
  clear() {
    this._activeCells.clear();
    this._stableCells.clear();
  }

  /**
   * Steps the state of the board forward.
   */
  step() {
    // Calculate the next state of every active cell.
    const nextActiveCells = new Map();
    for (const [key, cell] of this._activeCells) {
      const next = cell.next(this._neighbors(cell).filter(neighbor => neighbor.alive).length);
      if (cell.alive !== next.alive) {
        nextActiveCells.set(key, next);
      } else if (next.alive) {
        this._stableCells.set(key, next);
      }
    }
    this._activeCells = nextActiveCells;

    // Activate the neighbors of each active cell.
    for (const cell of Array.from(this._activeCells.values())) {
      for (const neighbor of this._neighbors(cell)) {
        this._activeCells.set(keyFromCell(neighbor), neighbor);
        this._stableCells.delete(keyFromCell(neighbor));
      }
    }
  }

  /**
   * Returns a generator for the board's live cells.
   *
   * @return {Generator<Cell>} A generator for the board's live cells.
   */
  *liveCells() {
    for (const cell of this._activeCells.values()) {
      if (cell.alive) {
        yield cell;
      }
    }

    for (const cell of this._stableCells.values()) {
      yield cell;
    }
  }

  /**
   * Returns the neighbors of the given cell.
   *
   * @param {Cell} cell - The cell whose neighbors will be returned.
   * @return {Cell[]} The given cell's neighbors.
   */
  _neighbors(cell) {
    const neighbors = [];
    for (let i = cell.row - 1; i <= cell.row + 1; i++) {
      for (let j = cell.column - 1; j <= cell.column + 1; j++) {
        if (i !== cell.row || j !== cell.column) {
          neighbors.push(this.get(i, j));
        }
      }
    }
    return neighbors;
  }
}

/**
 * Returns the map key for the given row and column.
 *
 * @param {number} row - The key's row.
 * @param {number} column - The key's column.
 * @return {string} The map key for the given row and column.
 */
function keyFromCoordinates(row, column) {
  return row + "," + column;
}

/**
 * Returns the map key for the given cell.
 *
 * @param {Cell} cell - The key's cell.
 * @return {string} The map key for the given cell.
 */
function keyFromCell(cell) {
  return keyFromCoordinates(cell.row, cell.column);
}
