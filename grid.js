"use strict";

/**
 * The width and height of each cell in pixels.
 *
 * @type {number}
 */
const CELL_SIZE = 15;

/**
 * The color of the gridlines.
 *
 * @type {string}
 */
const GRID_COLOR = "#eee";

/**
 * Shows cells from a Game of Life in a grid on a canvas.
 */
class Grid {
    /**
     * Creates a new grid.
     *
     * @param {Board} board - The board for the Game of Life.
     * @param {HTMLCanvasElement} canvas - The canvas to show the board on.
     */
    constructor(board, canvas) {
        this._board = board;
        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");
        this._translation = new Point(0, 0);
    }

    /**
     * Resizes the canvas.
     *
     * @param {number} width - The new width of the canvas.
     * @param {number} height - The new height of the canvas.
     */
    resize(width, height) {
        this._canvas.width = width;
        this._canvas.height = height;
        this._ctx.translate(this._translation.x, this._translation.y);
        this.draw();
    }

    /**
     * Translates the visible region of the grid on the canvas.
     *
     * @param {number} x - The number of pixels to translate horizontally.
     * @param {number} y - The number of pixels to translate vertically.
     */
    translate(x, y) {
        this._ctx.translate(x, y);
        this._translation = this._translation.translate(x, y);
        this.draw();
    }

    /**
     * Returns the cell at the given x and y coordinates on the canvas.
     *
     * @param {number} x - An x coordinate in the grid.
     * @param {number} y - A y coordinate in the grid.
     * @return {Cell} The cell at the given x and y coordinates.
     */
    get(x, y) {
        let gridPoint = this._canvasToGrid(x, y);
        let row = Math.floor(gridPoint.y / CELL_SIZE);
        let column = Math.floor(gridPoint.x / CELL_SIZE);
        return this._board.get(row, column);
    }

    /**
     * Draws the grid.
     */
    draw() {
        let ctx = this._ctx;
        let origin = this._canvasToGrid(0, 0);
        ctx.clearRect(origin.x - 0.5, origin.y - 0.5, ctx.canvas.width + 0.5, ctx.canvas.height + 0.5);
        this._drawCells();
        this._drawGridlines();
    }

    /**
     * Draws the gridlines.
     */
    _drawGridlines() {
        let ctx = this._ctx;
        ctx.lineWidth = 1;
        ctx.strokeStyle = GRID_COLOR;

        let origin = this._canvasToGrid(0, 0);
        let topLine = Math.floor(origin.y / CELL_SIZE) * CELL_SIZE;
        let leftLine = Math.floor(origin.x / CELL_SIZE) * CELL_SIZE;

        // Draw the vertical gridlines.
        for (let i = leftLine; i <= origin.x + ctx.canvas.width; i += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(i - 0.5, topLine - 0.5);
            ctx.lineTo(i - 0.5, topLine + ctx.canvas.height + CELL_SIZE + 0.5);
            ctx.stroke();
        }

        // Draw the horizontal gridlines.
        for (let j = topLine; j <= origin.y + ctx.canvas.height; j += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(leftLine - 0.5, j - 0.5);
            ctx.lineTo(leftLine + ctx.canvas.width + CELL_SIZE + 0.5, j - 0.5);
            ctx.stroke();
        }
    }

    /**
     * Draws the live cells.
     */
    _drawCells() {
        let ctx = this._ctx;
        for (let cell of this._board) {
            ctx.fillRect(cell.column * CELL_SIZE - 1, cell.row * CELL_SIZE - 1, CELL_SIZE + 1, CELL_SIZE + 1);
        }
    }

    /**
     * Converts a point relative to the canvas's top-left corner to point
     * relative to the grid's origin.
     *
     * @param {number} x - An x coordinate in canvas coordinates.
     * @param {number} y - A y coordinate in canvas coordinates.
     * @return {Point} The corresponding point in grid coordinates.
     */
    _canvasToGrid(x, y) {
        return new Point(x - this._translation.x, y - this._translation.y);
    }
}
