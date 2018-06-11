<template>
<div tabindex="-1" @keyup.space="playing = !playing">
    <div id="toolbar">
        <span class="item"
            ><label><input type="checkbox" v-model="playing">Play</label
        ></span
        ><span class="item"
            ><input id="zoom" type="range" @input="zoom"
                :min="CELL_SIZE_MIN" :max="CELL_SIZE_MAX" :value="cellSize"
            ><label for="zoom">{{ cellSize }}%</label
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
    padding: 5px;

    text-align: center;

    background: #fff;
    border-bottom: #eee 1px solid;
}
#toolbar .item {
    margin: 0 20px;
}
#zoom {
    width: 100px;
    margin-bottom: -5px;
    margin-right: 0;
}
label[for="zoom"] {
    display: inline-block;
    min-width: 50px;
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
    _tickId = 0;

    created() {
        // Add constants.
        this.CELL_SIZE_MIN = CELL_SIZE_MIN;
        this.CELL_SIZE_MAX = CELL_SIZE_MAX;

        // Add non-reactive data.
        this._board = new Board();
        this._grid = null;
        this._drag = null;
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
        return this.$data._tickId != 0;
    }

    /**
     * Sets whether the game is playing or paused.
     *
     * @param {boolean} playing - True to start playing the game or
     *     false to pause the game.
     */
    set playing(playing) {
        if (playing && !this.playing) {
            let tick = () => {
                this._board.step();
                this._grid.draw();
            };
            this.$data._tickId = window.setInterval(tick, 500);
            tick();
        } else if (!playing && this.playing) {
            window.clearInterval(this.$data._tickId);
            this.$data._tickId = 0;
        }
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
