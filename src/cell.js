/**
 * A single cell in the Game of Life.
 */
export default class Cell {
  /**
   * Creates a new cell.
   *
   * @param {number} row - This cell's row number.
   * @param {number} column - This cell's column number.
   * @param {boolean} isAlive - True if this cell is alive, false otherwise.
   */
  constructor(row, column, isAlive) {
    /**
     * This cell's row number.
     *
     * @type {number}
     */
    this._row = row;

    /**
     * This cell's column number.
     *
     * @type {number}
     */
    this._column = column;

    /**
     * True if this cell is alive, false otherwise.
     *
     * @type {boolean}
     */
    this._isAlive = isAlive;
  }

  /**
   * This cell's row number.
   *
   * @type {number}
   */
  get row() {
    return this._row;
  }

  /**
   * This cell's column number.
   *
   * @type {number}
   */
  get column() {
    return this._column;
  }

  /**
   * True if this cell is alive, false otherwise.
   *
   * @type {boolean}
   */
  get isAlive() {
    return this._isAlive;
  }

  /**
   * Returns the next state of this cell based on how many neighbors are alive.
   *
   * @param {number} liveNeighbors - The number of this cell's neighbors that are alive.
   * @return {Cell} The next state of this cell.
   */
  next(liveNeighbors) {
    if (this._isAlive && (liveNeighbors < 2 || liveNeighbors > 3)) {
      return new Cell(this._row, this._column, false);
    } else if (!this._isAlive && liveNeighbors === 3) {
      return new Cell(this._row, this._column, true);
    } else {
      return this;
    }
  }
}
