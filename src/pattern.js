import Cell from "./cell.js";
import {cellsFromRle} from "./rle.js";

/**
 * A pattern preset has a pattern's serialized string as well as metadata for the pattern.
 *
 * @typedef {Object} PatternPreset
 * @property {string} name - The name of the pattern.
 * @property {string} author - The author of the pattern.
 * @property {string} description - A description of the pattern.
 * @property {string} url - The URL to the pattern's web page.
 * @property {string} rule - The rulestring for the pattern in B/S notation.
 * @property {string} pattern - The run-length encoded pattern string, excluding metadata.
 * @see http://conwaylife.com/wiki/Run_Length_Encoded
 */

/**
 * An enum of rotational directions.
 *
 * @type {Object}
 * @property {symbol} CLOCKWISE - Clockwise rotation.
 * @property {symbol} COUNTERCLOCKWISE - Counterclockwise rotation.
 */
export const Rotation = Object.freeze({
  CLOCKWISE: Symbol("CLOCKWISE"),
  COUNTERCLOCKWISE: Symbol("COUNTERCLOCKWISE")
});

/**
 * An immutable collection of cells.
 */
export default class Pattern {
  /**
   * A map from coordinates to cells that may change in the next time step and must be simulated.
   * Cells in the map can be either alive or dead.
   *
   * @type {Map<string, Cell>}
   */
  _activeCells = new Map();

  /**
   * A map from coordinates to cells that cannot change in the next time step and should be ignored
   * in the simulation. Cells in the map must be alive.
   *
   * @type {Map<string, Cell>}
   */
  _stableCells = new Map();

  /**
   * True if this pattern contains no live cells, false otherwise.
   *
   * @type {boolean}
   */
  get isEmpty() {
    for (const cell of this.liveCells()) {
      return false;
    }
    return true;
  }

  /**
   * The width of this pattern. The width is the number of cells spanned from
   * the leftmost live cell to the rightmost live cell.
   *
   * @type {number}
   */
  get width() {
    const columns = Array.from(this.liveCells()).map(cell => cell.column);
    if (columns.length === 0) {
      return 0;
    }
    return Math.max(...columns) - Math.min(...columns) + 1;
  }

  /**
   * The height of this pattern. The height is the number of cells spanned
   * from the topmost live cell to the bottommost live cell.
   *
   * @type {number}
   */
  get height() {
    const rows = Array.from(this.liveCells()).map(cell => cell.row);
    if (rows.length === 0) {
      return 0;
    }
    return Math.max(...rows) - Math.min(...rows) + 1;
  }

  /**
   * Returns the cell at the given row and column.
   *
   * @param {number} row - The row number of the cell.
   * @param {number} column - The column number of the cell.
   * @return {Cell} The cell at the given row and column.
   */
  cell(row, column) {
    const key = makeKey(row, column);
    if (this._activeCells.has(key)) {
      return this._activeCells.get(key);
    }
    if (this._stableCells.has(key)) {
      return this._stableCells.get(key);
    }
    return new Cell(row, column, false);
  }

  /**
   * Returns a copy of this pattern centered at the given row and column.
   *
   * @param {number} row - The new row the pattern is centered on.
   * @param {number} column - The new column the pattern is centered on.
   * @return {Pattern} A copy of this pattern centered at the given row and column.
   */
  centered(row, column) {
    const rows = Array.from(this.liveCells()).map(cell => cell.row);
    const rowShift = row - Math.round((Math.min(...rows) + Math.max(...rows)) / 2);
    const columns = Array.from(this.liveCells()).map(cell => cell.column);
    const columnShift = column - Math.round((Math.min(...columns) + Math.max(...columns)) / 2);

    return this._map(
      cell => new Cell(cell.row + rowShift, cell.column + columnShift, cell.isAlive)
    );
  }

  /**
   * Returns a copy of this pattern rotated about the given pivot cell.
   *
   * @param {Rotation} direction - The direction of rotation.
   * @param {number} pivotRow - The row of the pivot cell.
   * @param {number} pivotColumn - The column of the pivot cell.
   * @return {Pattern} A copy of this pattern rotated about the given pivot cell.
   */
  rotated(direction, pivotRow, pivotColumn) {
    const sign = direction === Rotation.CLOCKWISE ? 1 : -1;

    return this._map(cell => new Cell(
      pivotRow + sign * (cell.column - pivotColumn),
      pivotColumn - sign * (cell.row - pivotRow),
      cell.isAlive
    ));
  }

  /**
   * Returns a generator for this pattern's live cells.
   *
   * @return {Generator<Cell>} A generator for this pattern's live cells.
   */
  * liveCells() {
    for (const cell of this._activeCells.values()) {
      if (cell.isAlive) {
        yield cell;
      }
    }

    for (const cell of this._stableCells.values()) {
      yield cell;
    }
  }

  /**
   * Returns a copy of this pattern with the given cells changed.
   *
   * @param {Iterable<Cell>} cells - The cells to change.
   * @return {Pattern} A copy of this pattern with the given cells changed.
   */
  withCells(cells) {
    const pattern = new Pattern();
    pattern._activeCells = new Map(this._activeCells);
    pattern._stableCells = new Map(this._stableCells);

    // Change the cells.
    const changes = [];
    for (const cell of cells) {
      if (cell.isAlive !== this.cell(cell.row, cell.column).isAlive) {
        const key = makeKey(cell.row, cell.column);
        pattern._activeCells.set(key, cell);
        pattern._stableCells.delete(key);
        changes.push(cell);
      }
    }

    // Activate the neighbors of each changed cell.
    for (const cell of changes) {
      for (const neighbor of pattern._neighbors(cell)) {
        const key = makeKey(neighbor.row, neighbor.column);
        pattern._activeCells.set(key, neighbor);
        pattern._stableCells.delete(key);
      }
    }

    return pattern;
  }

  /**
   * Merges this pattern with the given pattern and returns the resulting pattern.
   *
   * @param {Pattern} pattern - The pattern to merge with this pattern.
   * @return {Pattern} The resulting pattern.
   */
  merged(pattern) {
    return this.withCells(pattern.liveCells());
  }

  /**
   * Returns the next state of this pattern.
   *
   * @return {Pattern} The next state of this pattern.
   */
  next() {
    const pattern = new Pattern();
    pattern._stableCells = new Map(this._stableCells);

    // Simulate each active cell.
    const changes = [];
    for (const [key, cell] of this._activeCells) {
      const next = cell.next(this._neighbors(cell).filter(neighbor => neighbor.isAlive).length);
      if (cell.isAlive !== next.isAlive) {
        pattern._activeCells.set(key, next);
        changes.push(next);
      } else if (next.isAlive) {
        pattern._stableCells.set(key, next);
      }
    }

    // Activate the neighbors of each changed cell.
    for (const cell of changes) {
      for (const neighbor of pattern._neighbors(cell)) {
        const key = makeKey(neighbor.row, neighbor.column);
        pattern._activeCells.set(key, neighbor);
        pattern._stableCells.delete(key);
      }
    }

    return pattern;
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
          neighbors.push(this.cell(i, j));
        }
      }
    }
    return neighbors;
  }

  /**
   * Maps every cell in this pattern to the cell given by the mapper function and returns the
   * resulting pattern.
   *
   * @param {function(cell: Cell): Cell} mapper - The mapper function.
   * @return {Pattern} The resulting pattern.
   */
  _map(mapper) {
    const pattern = new Pattern();
    for (const cell of this._activeCells.values()) {
      const mapped = mapper(cell);
      pattern._activeCells.set(makeKey(mapped.row, mapped.column), mapped);
    }
    for (const cell of this._stableCells.values()) {
      const mapped = mapper(cell);
      pattern._stableCells.set(makeKey(mapped.row, mapped.column), mapped);
    }
    return pattern;
  }

  /**
   * Creates a pattern from the given preset.
   *
   * @param {PatternPreset} preset - The pattern preset.
   * @return {Pattern} The pattern corresponding to the given preset.
   */
  static fromPreset(preset) {
    return new Pattern().withCells(cellsFromRle(preset.pattern));
  }
}

/**
 * Returns the map key for the given row and column.
 *
 * @param {number} row - The key's row.
 * @param {number} column - The key's column.
 * @return {string} The map key for the given row and column.
 */
function makeKey(row, column) {
  return row + "," + column;
}
