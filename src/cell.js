/**
 * A single cell in the Game of Life.
 */
export default class Cell {
    /**
     * Creates a new cell.
     *
     * @param {number} row - The cell's row number.
     * @param {number} column - The cell's column number.
     * @param {boolean} alive - Whether the cell is alive or not.
     */
    constructor(row, column, alive) {
        this._row = row;
        this._column = column;
        this._alive = alive;
    }

    /**
     * Returns this cell's row number.
     *
     * @return {number} This cell's row number.
     */
    get row() {
        return this._row;
    }

    /**
     * Returns this cell's column number.
     *
     * @return {number} This cell's column number.
     */
    get column() {
        return this._column;
    }

    /**
     * Returns whether this cell is alive or not.
     *
     * @return {boolean} True if this cell is alive, otherwise false.
     */
    get alive() {
        return this._alive;
    }

    /**
     * Returns the next state of this cell based on how many neighbors are
     * alive.
     *
     * @param {number} numLiveNeighbors - The number of this cell's neighbors
     *     that are alive.
     * @return {Cell} The next state of this cell.
     */
    next(numLiveNeighbors) {
        if (this._alive && (numLiveNeighbors < 2 || numLiveNeighbors > 3)) {
            return new Cell(this._row, this._column, false);
        } else if (!this._alive && numLiveNeighbors == 3) {
            return new Cell(this._row, this._column, true);
        } else {
            return this;
        }
    }
}
