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
    }

    /**
     * Plays the Game of Life if it's paused.
     */
    play() {
        if (this._ticker == 0) {
            this._board.step();
            this._grid.draw();

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
}

// Let the Game of Life be in the global scope so it can be accessed from the
// JavaScript console.
let life = null;

window.addEventListener("load", function() {
    life = new Life(document.getElementById("canvas"));

    // Play/pause the game by clicking the button.
    let playButton = document.getElementById("play");
    playButton.addEventListener("change", () => {
        if (playButton.checked) {
            life.play();
        } else {
            life.pause();
        }
    });

    // Play/pause the game by pressing the space bar.
    document.addEventListener("keydown", (event) => {
        if (event.key == " " && event.target != playButton) {
            playButton.click();
        }
    });
});
