"use strict";

/**
 * The Game of Life.
 */
class Life {
    /**
     * Creates a new Game of Life.
     *
     * @param {HTMLCanvasElement} canvas - The canvas to show the game on.
     */
    constructor(canvas) {
        this._board = new Board();
        this._grid = new Grid(this._board, canvas);
        this._ticker = 0;

        // Resize the canvas to fit the window.
        this._grid.resize(window.innerWidth, window.innerHeight);
        window.addEventListener("resize", () => this._grid.resize(window.innerWidth, window.innerHeight));

        // Add event listeners for clicking and panning.
        this._panStart = new Point(0, 0);
        this._lastMouse = new Point(0, 0);
        canvas.addEventListener("mousedown", (event) => this._onMouseDown(event));
        canvas.addEventListener("mousemove", (event) => this._onMouseMove(event));
        canvas.addEventListener("mouseup", (event) => this._onMouseUp(event));
    }

    /**
     * Plays the Game of Life if it's paused.
     */
    play() {
        if (this._ticker == 0) {
            this._ticker = window.setInterval(() => {
                this._board.step();
                this._grid.draw();
            }, 500);
        }
    }

    /**
     * Pauses the Game of Life if it's playing.
     */
    pause() {
        if (this._ticker != 0) {
            window.clearInterval(this._ticker);
            this._ticker = 0;
        }
    }

    /**
     * Returns whether the Game of Life is playing or not.
     *
     * @return {boolean} True if the game is playing, otherwise false.
     */
    get playing() {
        return this._ticker != 0;
    }

    /**
     * Handles mousedown events on the canvas.
     *
     * @param {MouseEvent} event - The mousedown event.
     */
    _onMouseDown(event) {
        // Prepare to click or pan when the left mouse button is pressed.
        if (event.button == 0) {
            this._panStart = new Point(event.clientX, event.clientY);
            this._lastMouse = new Point(event.clientX, event.clientY);
        }
    }

    /**
     * Handles mousemove events on the canvas.
     *
     * @param {MouseEvent} event - The mousemove event.
     */
    _onMouseMove(event) {
        // Pan if the mouse is moved with the left mouse button down.
        if (event.buttons & 1) {
            let dx = event.clientX - this._lastMouse.x;
            let dy = event.clientY - this._lastMouse.y;
            this._lastMouse = new Point(event.clientX, event.clientY);
            this._grid.translate(dx, dy);
        }
    }

    /**
     * Handles mouseup events on the canvas.
     *
     * @param {MouseEvent} event - The mouseup event.
     */
    _onMouseUp(event) {
        // Toggle a cell when the left mouse button is clicked without panning.
        if (event.button == 0 && this._panStart.equals(this._lastMouse)) {
            let cell = this._grid.get(event.clientX, event.clientY);
            this._board.toggle(cell.row, cell.column);
            this._grid.draw();
        }
    }
}

// Let the Game of Life be in the global scope so it can be accessed from the
// JavaScript console.
let life = null;

window.addEventListener("load", function() {
    life = new Life(document.getElementById("canvas"));

    // Play/pause the game by pressing the space bar.
    document.addEventListener("keydown", (event) => {
        if (event.key == " ") {
            if (life.playing) {
                life.pause();
            } else {
                life.play();
            }
        }
    });
});
