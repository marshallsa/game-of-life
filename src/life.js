import Board from "./board.js";
import DragMotion from "./dragmotion.js";
import Grid from "./grid.js";
import Pattern, {Rotation} from "./pattern.js";
import PatternPicker from "./patternpicker.js";
import patternPresets from "../patterns.json";

import autobind from "autobind-decorator";

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
   * @property {number} cellSize - The width and height of each cell in pixels.
   * @property {number} frequency - The frequency of the game tick in Hertz.
   * @property {boolean} playing - True if the game is playing, or false if the game is paused.
   * @property {?PatternPreset} patternPreset - The selected pattern preset, or null if no preset is
   * selected.
   */
  state = {cellSize: 10, frequency: 5, playing: false, patternPreset: null};

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

  /** @override */
  componentDidMount() {
    this._board = new Board();
    this._grid = new Grid(this._board, this._canvas);
    this._grid.resize(window.innerWidth, window.innerHeight);
    this._grid.zoom(this.state.cellSize);
    window.addEventListener(
      "resize", () => this._grid.resize(window.innerWidth, window.innerHeight)
    );
  }

  /**
   * Plays or pauses the game.
   *
   * @param {ChangeEvent|KeyboardEvent} event - The event that triggered the play or pause.
   */
  @autobind
  _playPause(event) {
    let playing;
    if (event.type === "change" && event.target.type === "checkbox") {
      playing = event.target.checked;
    } else if (event.type === "keyup" && event.key === " " && event.target.type !== "checkbox") {
      playing = !this.state.playing;
    } else {
      return;
    }

    if (playing && !this.state.playing) {
      const tick = () => {
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
   * Changes the frequency of the game tick. The frequency is clamped between FREQUENCY_MIN and
   * FREQUENCY_MAX.
   *
   * @param {ChangeEvent} event - The event that triggered the frequency change.
   */
  @autobind
  _changeFrequency(event) {
    const frequency = Math.max(FREQUENCY_MIN, Math.min(event.target.valueAsNumber, FREQUENCY_MAX));
    this.setState({frequency});
  }

  /**
   * Zooms the grid to the given cell size. The cell size is clamped between CELL_SIZE_MIN and
   * CELL_SIZE_MAX.
   *
   * @param {ChangeEvent|WheelEvent} event - The event that triggered the zoom.
   */
  @autobind
  _zoom(event) {
    let cellSize, centerX, centerY;
    if (event.type === "change") {
      cellSize = event.target.valueAsNumber;
    } else if (event.type === "wheel") {
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
  @autobind
  _mouseDown(event) {
    // Prepare to drag if the left mouse button is pressed.
    if (event.button === 0) {
      this._drag = new DragMotion(event.clientX, event.clientY);
    }
  }

  /**
   * Handles mousemove events on the canvas.
   *
   * @param {MouseEvent} event - The mousemove event.
   */
  @autobind
  _mouseMove(event) {
    // Pan the grid if the mouse is dragged.
    if (event.buttons & 1) {
      const [dx, dy] = this._drag.update(event.clientX, event.clientY);
      if (dx !== 0 || dy !== 0) {
        this._canvas.style.cursor = "pointer";
        this._grid.translate(dx, dy);
      }
    }

    // Keep the selected pattern under the mouse pointer.
    if (this._grid.ghost !== null) {
      const cell = this._grid.get(event.clientX, event.clientY);
      this._grid.ghost = this._grid.ghost.center(cell.row, cell.column);
    }
  }

  /**
   * Handles mouseup events on the canvas.
   *
   * @param {MouseEvent} event - The mouseup event.
   */
  @autobind
  _mouseUp(event) {
    // Check if this was a click instead of a drag.
    if (event.button === 0 && !this._drag.moved) {
      if (this._grid.ghost === null) {
        // Toggle the clicked cell.
        const cell = this._grid.get(event.clientX, event.clientY);
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
   * Handles wheel events on the canvas.
   *
   * @param {WheelEvent} event - The wheel event.
   */
  @autobind
  _wheel(event) {
    if (this._grid.ghost === null) {
      // Zoom the grid.
      this._zoom(event);
    } else {
      // Rotate the selected pattern.
      const direction = event.deltaY > 0 ? Rotation.COUNTERCLOCKWISE : Rotation.CLOCKWISE;
      const pivot = this._grid.get(event.clientX, event.clientY);
      this._grid.ghost = this._grid.ghost.rotate(direction, pivot.row, pivot.column);
    }
  }

  /**
   * Changes or clears the selected pattern preset.
   *
   * @param {?PatternPreset} preset - The new selected pattern preset, or null to clear the selected
   * preset.
   */
  @autobind
  _changePattern(preset) {
    if (preset !== null) {
      // Show the pattern off-screen until the user moves their mouse over the canvas.
      const cell = this._grid.get(0, 0);
      const pattern = Pattern.fromPreset(preset);
      this._grid.ghost = pattern.center(cell.row - pattern.height, cell.column - pattern.width);
    } else {
      this._grid.ghost = null;
    }

    this.setState({patternPreset: preset});
  }

  /**
   * Removes all live cells from the board.
   */
  @autobind
  _clearBoard() {
    this._board.clear();
    this._grid.draw();
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
              onChange={this._changeFrequency}
            />
          </label>
          <label className="item">
            <input type="checkbox" checked={this.state.playing} onChange={this._playPause}/>
            <span>Play</span>
          </label>
          <label className="item">
            <button onClick={this._clearBoard}>Clear</button>
          </label>
          <label className="item">
            <input
              type="range"
              min={CELL_SIZE_MIN}
              max={CELL_SIZE_MAX}
              step="1"
              value={this.state.cellSize}
              onChange={this._zoom}
            />
            <span>{this.state.cellSize}:1</span>
          </label>
        </div>

        <div className="sidebar">
          <PatternPicker
            presets={patternPresets}
            selectedPreset={this.state.patternPreset}
            onPresetChange={this._changePattern}
          />
        </div>

        <canvas
          ref={canvas => this._canvas = canvas}
          onWheel={this._wheel}
          onMouseDown={this._mouseDown}
          onMouseMove={this._mouseMove}
          onMouseUp={this._mouseUp}
        />
      </div>
    );
  }
}
