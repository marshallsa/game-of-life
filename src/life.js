import Board from "./board.js";
import DragMotion from "./dragmotion.js";
import Grid from "./grid.js";
import {PATTERNS} from "./pattern.js";
import PatternPicker from "./patternpicker.js";

import React from "react";

/**
 * The minimum width and height of each cell in pixels.
 *
 * @type {number}
 */
const CELL_SIZE_MIN = 1;

/**
 * The maximum width and height of each cell in pixels.
 *
 * @type {number}
 */
const CELL_SIZE_MAX = 100;

/**
 * The minimum frequency of the game tick in Hertz.
 *
 * @type {number}
 */
const FREQUENCY_MIN = 1;

/**
 * The maximum frequency of the game tick in Hertz.
 *
 * @type {number}
 */
const FREQUENCY_MAX = 30;

/**
 * The Game of Life.
 */
export default class Life extends React.Component {
    /**
     * The game state.
     *
     * @override
     * @private
     * @type {Object}
     * @property {number} cellSize - The width and height of each cell in
     *     pixels.
     * @property {number} frequency - The frequency of the game tick in
     *     Hertz.
     * @property {boolean} playing - True if the game is playing, or false
     *     if the game is paused.
     * @property {?Pattern} pattern - The selected pattern, or null if no
     *     pattern is selected.
     */
    state = {cellSize: 15, frequency: 5, playing: false, pattern: null};

    /**
     * The game board that contains the cells.
     *
     * @type {?Board}
     */
    _board = null;

    /**
     * The canvas that shows the game.
     *
     * @type {?HTMLCanvasElement}
     */
    _canvas = null;

    /**
     * The game grid that shows the board on the canvas.
     *
     * @type {?Grid}
     */
    _grid = null;

    /**
     * Tracks the mouse while it's being dragged across the grid.
     *
     * @type {?DragMotion}
     */
    _drag = null;

    /**
     * The timeout ID for the next game tick.
     *
     * @type {number}
     */
    _tickId = 0;

    /**
     * Creates a new Game of Life.
     *
     * @param {Object} props - The component props.
     */
    constructor(props) {
        super(props);

        // Bind event handlers.
        this._playPause = this._playPause.bind(this);
        this._changeFrequency = this._changeFrequency.bind(this);
        this._zoom = this._zoom.bind(this);
        this._mouseDown = this._mouseDown.bind(this);
        this._mouseMove = this._mouseMove.bind(this);
        this._mouseUp = this._mouseUp.bind(this);
        this._changePattern = this._changePattern.bind(this);
    }

    /** @override */
    componentDidMount() {
        this._board = new Board();
        this._grid = new Grid(this._board, this._canvas);
        this._grid.resize(window.innerWidth, window.innerHeight);
        this._grid.zoom(this.state.cellSize);
        window.addEventListener("resize", () => this._grid.resize(window.innerWidth, window.innerHeight));
    }

    /**
     * Plays or pauses the game.
     *
     * @param {ChangeEvent|KeyboardEvent} event - The event that triggered the
     *     play or pause.
     */
    _playPause(event) {
        let playing;
        if (event.type == "change" && event.target.type == "checkbox") {
            playing = event.target.checked;
        } else if (event.type == "keyup" && event.key == " " && event.target.type != "checkbox") {
            playing = !this.state.playing;
        } else {
            return;
        }

        if (playing && !this.state.playing) {
            let tick = () => {
                this._board.step();
                this._grid.draw();
                if (this.state.playing) {
                    this._tickId = window.setTimeout(tick, 1000 / this.state.frequency);
                }
            };
            this.setState({playing}, tick);
        } else if (!playing && this.state.playing) {
            window.clearTimeout(this._tickId);
            this.setState({playing});
        }
    }

    /**
     * Changes the frequency of the game tick. The frequency is clamped between
     * FREQUENCY_MIN and FREQUENCY_MAX.
     *
     * @param {ChangeEvent} event - The event that triggered the frequency
     *     change.
     */
    _changeFrequency(event) {
        let frequency = Math.max(FREQUENCY_MIN, Math.min(event.target.valueAsNumber, FREQUENCY_MAX));
        this.setState({frequency});
    }

    /**
     * Zooms the grid to the given cell size. The cell size is clamped between
     * CELL_SIZE_MIN and CELL_SIZE_MAX.
     *
     * @param {ChangeEvent|WheelEvent} event - The event that triggered the
     *     zoom.
     */
    _zoom(event) {
        let cellSize, centerX, centerY;
        if (event.type == "change") {
            cellSize = event.target.valueAsNumber;
        } else if (event.type == "wheel") {
            cellSize = this._grid.cellSize - Math.round(event.deltaY);
            centerX = event.clientX;
            centerY = event.clientY;
        } else {
            return;
        }

        cellSize = Math.max(CELL_SIZE_MIN, Math.min(cellSize, CELL_SIZE_MAX));
        this._grid.zoom(cellSize, centerX, centerY);
        this.setState({cellSize});
    }

    /**
     * Handles mousedown events on the canvas.
     *
     * @param {MouseEvent} event - The mousedown event.
     */
    _mouseDown(event) {
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
    _mouseMove(event) {
        // Pan the grid if the mouse is dragged.
        if (event.buttons & 1) {
            let [dx, dy] = this._drag.update(event.clientX, event.clientY);
            if (dx != 0 || dy != 0) {
                this._canvas.style.cursor = "pointer";
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
    _mouseUp(event) {
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
                this._changePattern(null);
            }
        }

        this._canvas.style.cursor = "default";
        this._drag = null;
    }

    /**
     * Changes or clears the selected pattern.
     *
     * @param {?Pattern} pattern - The new selected pattern, or null to clear
     *     the selected pattern.
     */
    _changePattern(pattern) {
        if (pattern != null) {
            let cell = this._grid.get(this._canvas.width / 2, this._canvas.height / 2);
            pattern = pattern.center(cell.row, cell.column);
        }
        this._grid.ghost = pattern;
        this.setState({pattern});
    }

    /** @override */
    render() {
        return (
            <div tabIndex="-1" onKeyUp={this._playPause}>
                <div className="toolbar">
                    <label className="item">
                        <span>{this.state.frequency}×</span>
                        <input
                            type="range"
                            min={FREQUENCY_MIN}
                            max={FREQUENCY_MAX}
                            step="1"
                            value={this.state.frequency}
                            onChange={this._changeFrequency}/>
                    </label>
                    <label className="item">
                        <input type="checkbox" checked={this.state.playing} onChange={this._playPause}/>
                        <span>Play</span>
                    </label>
                    <label className="item">
                        <input
                            type="range"
                            min={CELL_SIZE_MIN}
                            max={CELL_SIZE_MAX}
                            step="1"
                            value={this.state.cellSize}
                            onChange={this._zoom}/>
                        <span>{this.state.cellSize}:1</span>
                    </label>
                </div>

                <div className="sidebar">
                    <PatternPicker
                        patterns={PATTERNS}
                        pattern={this.state.pattern}
                        onPatternChange={this._changePattern}/>
                </div>

                <canvas
                    ref={canvas => this._canvas = canvas}
                    onWheel={this._zoom}
                    onMouseDown={this._mouseDown}
                    onMouseMove={this._mouseMove}
                    onMouseUp={this._mouseUp}/>
            </div>
        );
    }
}
