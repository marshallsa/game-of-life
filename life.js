"use strict";

/**
 * The Game of Life.
 */
class Life {
    /**
     * Creates a new Game of Life.
     *
     * @param {Board} board - The game board.
     * @param {Grid} grid - The grid displaying the given board.
     */
    constructor(board, grid) {
        this._board = board;
        this._grid = grid;
        this._tickerId = 0;
    }

    /**
     * Adds event listeners for all of the game controls.
     */
    addEventListeners() {
        // Resize the canvas to fit the window.
        this._grid.resize(window.innerWidth, window.innerHeight);
        window.addEventListener("resize", () => this._grid.resize(window.innerWidth, window.innerHeight));

        this._addMouseListeners();
        this._addToolbarListeners();
        this._addKeyListeners();
    }

    /**
     * Adds event listeners for the mouse controls.
     */
    _addMouseListeners() {
        let canvas = document.getElementById("canvas");

        // Prepare to click or pan when the left mouse button is pressed.
        canvas.addEventListener("mousedown", (event) => {
            if (event.button == 0) {
                this._drag = new DragMotion(event.clientX, event.clientY);
            }
        });

        // Pan if the mouse is dragged with the left mouse button down.
        canvas.addEventListener("mousemove", (event) => {
            if (event.buttons & 1) {
                let [dx, dy] = this._drag.update(event.clientX, event.clientY);
                this._grid.translate(dx, dy);
            }
        });

        // Toggle a cell when the left mouse button is clicked without panning.
        canvas.addEventListener("mouseup", (event) => {
            if (event.button == 0 && !this._drag.moved) {
                let cell = this._grid.get(event.clientX, event.clientY);
                this._board.toggle(cell.row, cell.column);
                this._grid.draw();
            }
        });

        // Zoom the grid using the mouse wheel.
        canvas.addEventListener("wheel", (event) => {
            let cellSize = this._grid.cellSize - Math.round(event.deltaY);
            this._zoom(cellSize, event.clientX, event.clientY);
        });
    }

    /**
     * Adds event listeners for the toolbar controls.
     */
    _addToolbarListeners() {
        // Play/pause the game by clicking the button.
        document.getElementById("play").addEventListener("change", (event) => {
            if (event.target.checked) {
                this._play();
            } else {
                this._pause();
            }
        });

        // Zoom the grid using the slider.
        let zoom = document.getElementById("zoom");
        zoom.min = MIN_CELL_SIZE;
        zoom.value = this._grid.cellSize;
        zoom.max = MAX_CELL_SIZE;
        let zoomLabel = document.getElementById("zoom-label");
        zoom.addEventListener("input", (event) => this._zoom(event.target.value));
        zoom.dispatchEvent(new Event("input"));
    }

    /**
     * Adds event listeners for the keyboard controls.
     */
    _addKeyListeners() {
        // Play/pause the game by pressing the space bar.
        let playButton = document.getElementById("play");
        document.addEventListener("keyup", (event) => {
            if (event.key == " " && event.target.tagName != "INPUT") {
                if (this._playing) {
                    this._pause();
                } else {
                    this._play();
                }
            }
        });
    }

    /**
     * Plays the game if it's paused.
     */
    _play() {
        if (!this._playing) {
            document.getElementById("play").checked = true;
            let tick = () => {
                this._board.step();
                this._grid.draw();
            };
            this._tickerId = window.setInterval(tick, 500);
            tick();
        }
    }

    /**
     * Pauses the game if it's playing.
     */
    _pause() {
        if (this._playing) {
            document.getElementById("play").checked = false;
            window.clearInterval(this._tickerId);
            this._tickerId = 0;
        }
    }

    /**
     * Returns true if the game is playing, otherwise false.
     *
     * @return {boolean} True if the game is playing, otherwise false.
     */
    get _playing() {
        return this._tickerId != 0;
    }

    /**
     * Zooms the grid to the given cell size.
     *
     * @param {number} cellSize The new cell size.
     * @param {number} [centerX] The x coordinate to keep centered, if any.
     * @param {number} [centerY] The y coordinate to keep centered, if any.
     */
    _zoom(cellSize, centerX, centerY) {
        let slider = document.getElementById("zoom");
        slider.value = cellSize;
        document.getElementById("zoom-label").textContent =
            Math.round(slider.value / MAX_CELL_SIZE * 100) + "%";
        this._grid.zoom(slider.value, centerX, centerY);
    }
}

// Let the Game of Life be in the global scope so it can be accessed from the
// JavaScript console.
let life = null;

window.addEventListener("load", () => {
    let board = new Board();
    let grid = new Grid(board, document.getElementById("canvas"));
    life = new Life(board, grid);
    life.addEventListeners();
});
