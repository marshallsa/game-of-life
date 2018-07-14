import Point from "./point.js";

/**
 * The background color of the grid.
 *
 * @type {string}
 */
const BACKGROUND_COLOR = "#fff";

/**
 * The color of live cells.
 *
 * @type {string}
 */
const CELL_COLOR = "#000";

/**
 * The color of the ghost pattern's cells.
 *
 * @type {string}
 */
const GHOST_COLOR = "#aaa";

/**
 * The color of the gridlines.
 *
 * @type {string}
 */
const GRID_COLOR = "#eee";

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
    this._ghost = null;
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
   * The width and height of each cell in pixels. Use the {@link zoom} method to change the cell
   * size.
   *
   * @type {number}
   */
  get cellSize() {
    return this._cellSize;
  }

  /**
   * Zooms the grid to the given cell size, keeping the given point on the canvas centered. If no
   * center point is given, the center of the canvas is used by default.
   *
   * @param {number} cellSize - The new cell size.
   * @param {number} [centerX=canvas.width / 2] - The x coordinate to keep centered, or the
   * horizontal midline of the canvas if not given.
   * @param {number} [centerY=canvas.height / 2] - The y coordinate to keep centered, or the
   * vertical midline of the canvas if not given.
   * @throws {RangeError} If cellSize is zero or negative.
   */
  zoom(cellSize, centerX = this._ctx.canvas.width / 2, centerY = this._ctx.canvas.height / 2) {
    if (cellSize <= 0) {
      throw new RangeError("cellSize is zero or negative");
    }

    const gridCenter = this._canvasToGrid(centerX, centerY);
    const dx = gridCenter.x / this._cellSize * (cellSize - this._cellSize);
    const dy = gridCenter.y / this._cellSize * (cellSize - this._cellSize);

    this._cellSize = cellSize;
    this.translate(Math.round(-dx), Math.round(-dy));
  }

  /**
   * The current ghost pattern, or null if there is none. The ghost pattern is a static,
   * non-interacting pattern that appears on top of normal cells in a lighter color. It can be used
   * to show how a new pattern will look before being placed on the board.
   *
   * @type {?Pattern}
   */
  get ghost() {
    return this._ghost;
  }

  /**
   * Updates the current ghost pattern.
   *
   * @type {?Pattern}
   */
  set ghost(ghost) {
    this._ghost = ghost;
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
    const gridPoint = this._canvasToGrid(x, y);
    const row = Math.floor(gridPoint.y / this.cellSize);
    const column = Math.floor(gridPoint.x / this.cellSize);
    return this._board.get(row, column);
  }

  /**
   * Draws the grid.
   */
  draw() {
    const ctx = this._ctx;
    const origin = this._canvasToGrid(0, 0);
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(origin.x - 0.5, origin.y - 0.5, ctx.canvas.width + 0.5, ctx.canvas.height + 0.5);

    this._drawCells(this._board.liveCells(), CELL_COLOR);
    if (this._ghost !== null) {
      this._drawCells(this._ghost, GHOST_COLOR);
    }
    if (this.cellSize >= 10) {
      this._drawGridlines();
    }
  }

  /**
   * Draws the gridlines.
   */
  _drawGridlines() {
    const ctx = this._ctx;
    ctx.lineWidth = 1;
    ctx.strokeStyle = GRID_COLOR;

    const origin = this._canvasToGrid(0, 0);
    const topLine = Math.floor(origin.y / this.cellSize) * this.cellSize;
    const leftLine = Math.floor(origin.x / this.cellSize) * this.cellSize;

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
   * Draws the given cells.
   *
   * @param {Iterable.<Cell>} cells - The cells to draw.
   * @param {string} color - The color of the cells.
   */
  _drawCells(cells, color) {
    const ctx = this._ctx;
    ctx.fillStyle = color;
    for (const cell of cells) {
      ctx.fillRect(
        cell.column * this.cellSize,
        cell.row * this.cellSize,
        this.cellSize,
        this.cellSize
      );
    }
  }

  /**
   * Converts a point relative to the canvas's top-left corner to point relative to the grid's
   * origin.
   *
   * @param {number} x - An x coordinate in canvas coordinates.
   * @param {number} y - A y coordinate in canvas coordinates.
   * @return {Point} The corresponding point in grid coordinates.
   */
  _canvasToGrid(x, y) {
    return new Point(x - this._translation.x, y - this._translation.y);
  }
}
