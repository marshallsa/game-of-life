"use strict";

/**
  * The width and height of each cell in pixels.
  */
const CELL_SIZE = 15;

/**
  * The color of the gridlines.
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

        this._resize();
        window.addEventListener("resize", () => this._resize());
        canvas.addEventListener("click", (event) => this._click(event));
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

    /**
      * Resizes the canvas to fit the window size.
      */
    _resize() {
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
        this.draw();
    }

    /**
      * Toggles the cell that was clicked.
      *
      * @param {MouseEvent} event - The click event.
      */
    _click(event) {
        let row = Math.floor(event.clientY / CELL_SIZE);
        let column = Math.floor(event.clientX / CELL_SIZE);
        this._board.toggle(row, column);
        this.draw();
    }
}
