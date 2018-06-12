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

    <canvas ref="canvas" @wheel="zoom"
        @mousedown.left="beginDrag" @mousemove="drag" @mouseup.left="endDrag"
    ></canvas>
</div>
</template>

<style>
#toolbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 10px;

    text-align: center;

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

canvas {
    display: block;
}
</style>

<script>
import Board from "./board.js";
import Grid, {CELL_SIZE_MIN, CELL_SIZE_MAX} from "./grid.js";
import DragMotion from "./dragmotion.js";

import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class Life extends Vue {
    _cellSize = null;
    _frequency = 5;
    _playing = false;

    created() {
        // Add constants.
        this.CELL_SIZE_MIN = CELL_SIZE_MIN;
        this.CELL_SIZE_MAX = CELL_SIZE_MAX;
        this.FREQUENCY_MIN = 1;
        this.FREQUENCY_MAX = 30;

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
     * Zooms the grid to the given cell size.
     *
     * @param {InputEvent|WheelEvent} event - The event that triggered the
     *     zoom.
     */
    zoom(event) {
        if (event.type == "input") {
            this._grid.zoom(event.target.value);
        } else if (event.type == "wheel") {
            this._grid.zoom(this._grid.cellSize - Math.round(event.deltaY), event.clientX, event.clientY);
        }
        this.$data._cellSize = this._grid.cellSize;
    }

    /**
     * Marks the start of the mouse being dragged.
     *
     * @param {MouseEvent} event - The event that started the drag.
     */
    beginDrag(event) {
        this._drag = new DragMotion(event.clientX, event.clientY);
    }

    /**
     * Pans the grid when the mouse is dragged.
     *
     * @param {MouseEvent} event - The drag event.
     */
    drag(event) {
        if (event.buttons & 1) {
            let [dx, dy] = this._drag.update(event.clientX, event.clientY);
            this._grid.translate(dx, dy);
        }
    }

    /**
     * Marks the end of the mouse being dragged. Toggles a cell if the mouse
     * didn't move during the drag (i.e., the drag was actually a click).
     *
     * @param {MouseEvent} event - The event that ended the drag.
     */
    endDrag(event) {
        if (!this._drag.moved) {
            let cell = this._grid.get(event.clientX, event.clientY);
            this._board.toggle(cell.row, cell.column);
            this._grid.draw();
        }
        this._drag = null;
    }
}
</script>
