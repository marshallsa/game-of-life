<template>
<div tabindex="-1" @keyup.space="playing = !playing">
    <div id="toolbar">
        <span class="item"
            ><label for="speed">{{ frequency }}×</label
            ><input id="speed" type="range" v-model="frequency"
                :min="FREQUENCY_MIN" :max="FREQUENCY_MAX" step="1"
        ></span
        ><span class="item"
            ><label><input type="checkbox" v-model="playing">Play</label
        ></span
        ><span class="item"
            ><input id="zoom" type="range" @input="zoom" :value="cellSize"
                :min="CELL_SIZE_MIN" :max="CELL_SIZE_MAX" step="1"
            ><label for="zoom">{{ cellSize }}:1</label
        ></span>
    </div>

    <div id="sidebar">
        <ul id="patterns">
            <li v-for="pattern in PATTERNS">
                <a v-text="pattern.name"
                    @click.prevent="selectPattern(pattern.pattern)"></a>
            </li>
        </ul>
    </div>

    <canvas ref="canvas" @wheel="zoom" @mousedown="onMouseDown"
        @mousemove="onMouseMove" @mouseup="onMouseUp"></canvas>
</div>
</template>

<style>
#toolbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;

    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;

    background: #fff;
    border-bottom: #eee 1px solid;
}
#toolbar .item {
    margin: 0 20px;
}
#toolbar input[type="range"] {
    width: 100px;
    margin-bottom: -5px;
}
label {
    display: inline-block;
    min-width: 40px;
    text-align: right;
}
label[for="speed"] {
    margin-right: 10px;
}

#sidebar {
    position: absolute;
    top: 40px;
    left: 0;
    bottom: 0;
    width: 175px;

    background: #fff;
    border-right: #eee 1px solid;
}
#patterns {
    list-style-type: none;
    padding: 0 8px;
    margin: 0;
}
#patterns a {
    display: block;
    padding: 5px 5px;
    cursor: pointer;
}
#patterns a:hover {
    background: #eee;
}

canvas {
    display: block;
}
</style>

<script>
import Board from "./board.js";
import DragMotion from "./dragmotion.js";
import Grid from "./grid.js";
import Pattern, {PATTERNS} from "./pattern.js";

import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class Life extends Vue {
    _cellSize = null;
    _frequency = 5;
    _playing = false;

    created() {
        // Add constants.
        this.CELL_SIZE_MIN = 1;
        this.CELL_SIZE_MAX = 100;
        this.FREQUENCY_MIN = 1;
        this.FREQUENCY_MAX = 30;
        this.PATTERNS = PATTERNS;

        // Add non-reactive data.
        this._board = new Board();
        this._grid = null;
        this._drag = null;
        this._tickId = 0;
    }

    mounted() {
        this._grid = new Grid(this._board, this.$refs.canvas);
        this.$data._cellSize = this._grid.cellSize;
        this._grid.resize(window.innerWidth, window.innerHeight);
        window.addEventListener("resize", () => this._grid.resize(window.innerWidth, window.innerHeight));
    }

    /**
     * Returns the current cell size.
     *
     * @return {number} The current cell size.
     */
    get cellSize() {
        return this.$data._cellSize;
    }

    /**
     * Returns true if the game is playing, otherwise false.
     *
     * @return {boolean} True if the game is playing, otherwise false.
     */
    get playing() {
        return this.$data._playing;
    }

    /**
     * Sets whether the game is playing or paused.
     *
     * @param {boolean} playing - True to start playing the game or
     *     false to pause the game.
     */
    set playing(playing) {
        if (playing && !this.playing) {
            this.$data._playing = true;
            let tick = () => {
                this._board.step();
                this._grid.draw();
                if (this.playing) {
                    this._tickId = window.setTimeout(tick, 1000 / this.frequency);
                }
            };
            tick();
        } else if (!playing && this.playing) {
            this.$data._playing = false;
            window.clearTimeout(this._tickId);
        }
    }

    /**
     * Returns the frequency of the game tick in Hertz.
     *
     * @return {number} The frequency of the game tick in Hertz.
     */
    get frequency() {
        return this.$data._frequency;
    }

    /**
     * Sets the frequency of the game tick in Hertz. The frequency is clamped
     * between FREQUENCY_MIN and FREQUENCY_MAX.
     *
     * @param {number} frequency - The frequency of the game tick in Hertz.
     */
    set frequency(frequency) {
        this.$data._frequency = Math.max(this.FREQUENCY_MIN, Math.min(frequency, this.FREQUENCY_MAX));
    }

    /**
     * Zooms the grid to the given cell size. The cell size is clamped between
     * CELL_SIZE_MIN and CELL_SIZE_MAX.
     *
     * @param {InputEvent|WheelEvent} event - The event that triggered the
     *     zoom.
     * @throws {TypeError} If the event is not an input or wheel event.
     */
    zoom(event) {
        let cellSize, centerX, centerY;
        if (event.type == "input") {
            cellSize = event.target.valueAsNumber;
        } else if (event.type == "wheel") {
            cellSize = this._grid.cellSize - Math.round(event.deltaY);
            centerX = event.clientX;
            centerY = event.clientY;
        } else {
            throw new TypeError("Invalid event type");
        }

        cellSize = Math.max(this.CELL_SIZE_MIN, Math.min(cellSize, this.CELL_SIZE_MAX));
        this._grid.zoom(cellSize, centerX, centerY);
        this.$data._cellSize = cellSize;
    }

    /**
     * Handles mousedown events on the canvas.
     *
     * @param {MouseEvent} event - The mousedown event.
     */
    onMouseDown(event) {
        // Prepare to drag if the left mouse button is pressed.
        if (event.button == 0) {
            this._drag = new DragMotion(event.clientX, event.clientY);
        }
    }

    /**
     * Handles mousemove events on the canvas.
     *
     * @param {MouseEvent} event - The mousemove event.
     */
    onMouseMove(event) {
        // Pan the grid if the mouse is dragged.
        if (event.buttons & 1) {
            let [dx, dy] = this._drag.update(event.clientX, event.clientY);
            if (dx != 0 || dy != 0) {
                this.$refs.canvas.style.cursor = "pointer";
                this._grid.translate(dx, dy);
            }
        }

        // Keep the selected pattern under the mouse pointer.
        if (this._grid.ghost != null) {
            let cell = this._grid.get(event.clientX, event.clientY);
            this._grid.ghost = this._grid.ghost.center(cell.row, cell.column);
        }
    }

    /**
     * Handles mouseup events on the canvas.
     *
     * @param {MouseEvent} event - The mouseup event.
     */
    onMouseUp(event) {
        // Check if this was a click instead of a drag.
        if (event.button == 0 && !this._drag.moved) {
            if (this._grid.ghost == null) {
                // Toggle the clicked cell.
                let cell = this._grid.get(event.clientX, event.clientY);
                this._board.toggle(cell.row, cell.column);
                this._grid.draw();
            } else {
                // Place the selected pattern on the board.
                this._board.add(this._grid.ghost);
                this._grid.ghost = null;
            }
        }

        this.$refs.canvas.style.cursor = "default";
        this._drag = null;
    }

    /**
     * Selects the pattern so it can be placed on the board.
     *
     * @param {Pattern} pattern - The pattern to select.
     */
    selectPattern(pattern) {
        let cell = this._grid.get(this.$refs.canvas.width / 2, this.$refs.canvas.height / 2);
        this._grid.ghost = pattern.center(cell.row, cell.column);
    }
}
</script>
