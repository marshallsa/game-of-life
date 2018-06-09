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
        this.draw();
    }

    /**
     * Returns the cell at the given x and y coordinates in the grid.
     *
     * @param {number} x - An x coordinate in the grid.
     * @param {number} y - A y coordinate in the grid.
     * @return {Cell} The cell at the given x and y coordinates.
     */
    get(x, y) {
        let row = Math.floor(y / CELL_SIZE);
        let column = Math.floor(x / CELL_SIZE);
        return this._board.get(row, column);
    }

    /**
     * Draws the grid.
     */
    draw() {
        let ctx = this._ctx;
        ctx.clearRect(-0.5, -0.5, ctx.canvas.width + 0.5, ctx.canvas.height + 0.5);
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

        // Draw the vertical gridlines.
        for (let i = 0; i <= ctx.canvas.width; i += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(i - 0.5, -0.5);
            ctx.lineTo(i - 0.5, ctx.canvas.height + 0.5);
            ctx.stroke();
        }

        // Draw the horizontal gridlines.
        for (let j = 0; j <= ctx.canvas.height; j += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(-0.5, j - 0.5);
            ctx.lineTo(ctx.canvas.width * CELL_SIZE + 0.5, j - 0.5);
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
}
