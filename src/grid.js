import Point from "./point.js";

/**
 * The color of the gridlines.
 *
 * @type {string}
 */
const GRID_COLOR = "#eee";

/**
 * The minimum width and height of a cell in pixels.
 *
 * @type {number}
 */
export const CELL_SIZE_MIN = 1;

/**
 * The maximum width and height of a cell in pixels.
 *
 * @type {number}
 */
export const CELL_SIZE_MAX = 100;

/**
 * Shows cells from a Game of Life in a grid on a canvas.
 */
export default class Grid {
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
        this._cellSize = 15;
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
     * Returns the width and height of each cell in pixels.
     *
     * @return {number} The width and height of each cell in pixels.
     */
    get cellSize() {
        return this._cellSize;
    }

    /**
     * Zooms the grid to the given cell size, keeping the given point on the
     * canvas centered. If no center point is given, the center of the canvas is
     * used by default.
     *
     * @param {number} cellSize The new cell size.
     * @param {number} [centerX] The x coordinate to keep centered, or the
     *     horizontal midline of the canvas if not given.
     * @param {number} [centerY] The y coordinate to keep centered, or the
     *     vertical midline of the canvas if not given.
     */
    zoom(cellSize, centerX, centerY) {
        cellSize = Math.max(CELL_SIZE_MIN, Math.min(cellSize, CELL_SIZE_MAX));
        if (centerX === undefined)
            centerX = this._ctx.canvas.width / 2;
        if (centerY === undefined)
            centerY = this._ctx.canvas.height / 2;

        let gridCenter = this._canvasToGrid(centerX, centerY);
        let dx = gridCenter.x / this._cellSize * (cellSize - this._cellSize);
        let dy = gridCenter.y / this._cellSize * (cellSize - this._cellSize);

        this._cellSize = cellSize;
        this.translate(Math.round(-dx), Math.round(-dy));
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
        let row = Math.floor(gridPoint.y / this.cellSize);
        let column = Math.floor(gridPoint.x / this.cellSize);
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
        if (this.cellSize >= 10) {
            this._drawGridlines();
        }
    }

    /**
     * Draws the gridlines.
     */
    _drawGridlines() {
        let ctx = this._ctx;
        ctx.lineWidth = 1;
        ctx.strokeStyle = GRID_COLOR;

        let origin = this._canvasToGrid(0, 0);
        let topLine = Math.floor(origin.y / this.cellSize) * this.cellSize;
        let leftLine = Math.floor(origin.x / this.cellSize) * this.cellSize;

        // Draw the vertical gridlines.
        for (let i = leftLine; i <= origin.x + ctx.canvas.width; i += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(i - 0.5, topLine - 0.5);
            ctx.lineTo(i - 0.5, topLine + ctx.canvas.height + this.cellSize + 0.5);
            ctx.stroke();
        }

        // Draw the horizontal gridlines.
        for (let j = topLine; j <= origin.y + ctx.canvas.height; j += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(leftLine - 0.5, j - 0.5);
            ctx.lineTo(leftLine + ctx.canvas.width + this.cellSize + 0.5, j - 0.5);
            ctx.stroke();
        }
    }

    /**
     * Draws the live cells.
     */
    _drawCells() {
        let ctx = this._ctx;
        for (let cell of this._board) {
            ctx.fillRect(cell.column * this.cellSize, cell.row * this.cellSize, this.cellSize, this.cellSize);
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
