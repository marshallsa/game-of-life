import Cell from "./cell.js";

/**
 * A board containing all of the cells for a Game of Life.
 */
export default class Board {
    /**
     * Creates a new board.
     */
    constructor() {
        this._liveCells = new Map();
    }

    /**
     * Toggles the state of the cell at the given row and column from alive to
     * dead or from dead to alive.
     *
     * @param {number} row - The row number of the cell.
     * @param {number} column - The column number of the cell.
     */
    toggle(row, column) {
        let key = Board._toMapKey(row, column);
        if (this._liveCells.has(key)) {
            this._liveCells.delete(key);
        } else {
            this._liveCells.set(key, new Cell(row, column, true));
        }
    }

    /**
     * Returns the cell at the given row and column.
     *
     * @param {number} row - The row number of the cell.
     * @param {number} column - The column number of the cell.
     * @return {Cell} The cell at the given row and column.
     */
    get(row, column) {
        let key = Board._toMapKey(row, column);
        if (this._liveCells.has(key)) {
            return this._liveCells.get(key);
        } else {
            return new Cell(row, column, false);
        }
    }

    /**
     * Steps the state of the board forward.
     */
    step() {
        // Calculate the next state of every live cell and its neighbors.
        let nextCells = new Map();
        for (let cell of this) {
            nextCells.set(Board._toMapKey(cell), cell.next(this._numLiveNeighbors(cell)));

            for (let neighbor of this._neighbors(cell)) {
                nextCells.set(Board._toMapKey(neighbor), neighbor.next(this._numLiveNeighbors(neighbor)));
            }
        }

        // Remove dead cells from the next board state and replace the current
        // state.
        for (let cell of nextCells.values()) {
            if (!cell.alive) {
                nextCells.delete(Board._toMapKey(cell));
            }
        }
        this._liveCells = nextCells;
    }

    /**
     * Returns an iterator for the board's live cells.
     *
     * @return {Iterator} An iterator for the board's live cells.
     */
    [Symbol.iterator]() {
        return this._liveCells.values();
    }

    /**
     * Returns the neighbors of the given cell.
     *
     * @param {Cell} cell - The cell whose neighbors will be returned.
     * @return {Array<Cell>} The given cell's neighbors.
     */
    _neighbors(cell) {
        let neighbors = [];
        for (let i = cell.row - 1; i <= cell.row + 1; i++) {
            for (let j = cell.column - 1; j <= cell.column + 1; j++) {
                if (i != cell.row || j != cell.column) {
                    neighbors.push(this.get(i, j));
                }
            }
        }
        return neighbors;
    }

    /**
     * Returns how many of the given cell's neighbors are alive.
     *
     * @param {Cell} cell - The cell whose live neighbors will be counted.
     * @return {number} The number of the given cell's neighbors that are
     *     alive.
     */
    _numLiveNeighbors(cell) {
        return this._neighbors(cell).filter(neighbor => neighbor.alive).length;
    }

    /**
     * Returns the map key for the given cell or row and column numbers. This
     * method accepts either one argument (the cell) or two arguments (the row
     * and column numbers).
     *
     * @param {number} [row] - The cell's row number.
     * @param {number} [column] - The cell's column number.
     * @param {Cell} [cell] - The cell itself.
     * @return {String} The map key for the given cell or row and column
     *     numbers.
     */
    static _toMapKey() {
        if (arguments.length >= 2) {
            return arguments[0] + "," + arguments[1];
        } else {
            return Board._toMapKey(arguments[0].row, arguments[0].column);
        }
    }
}
