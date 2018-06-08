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
}

window.addEventListener("load", function() {
    let life = new Life(document.getElementById("canvas"));
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
