import Board from "./board.js";
import Cell from "./cell.js";
import Pattern, {Rotation} from "./pattern.js";
import PatternPicker from "./patternpicker.js";
import Timeline from "./timeline.js";
import patternPresets from "../patterns.json";

import React from "react";

import {faFile} from "@fortawesome/free-regular-svg-icons";
import {
  faCaretLeft,
  faCaretRight,
  faPauseCircle,
  faPlayCircle
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

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
   * The timeline of board states.
   *
   * @type {Timeline}
   */
  _timeline = new Timeline();

  /**
   * The game state.
   *
   * @override
   * @private
   * @type {Object}
   * @property {number} cellSize - The width and height of each cell in pixels.
   * @property {number} frequency - The frequency of the game tick in Hertz.
   * @property {boolean} isPlaying - True if the game is playing, or false if the game is paused.
   * @property {?PatternPreset} selectedPreset - The selected pattern preset, or null if no preset
   * is selected.
   * @property {?Pattern} selectedPattern - The pattern for the selected pattern preset, or null if
   * no preset is selected.
   * @property {number} width - The width of the board.
   * @property {number} height - The height of the board.
   * @property {number} centerRow - The row of the cell at the center of the board.
   * @property {number} centerColumn - The column of the cell at the center of the board.
   * @property {Pattern} universe - The current board state.
   */
  state = {
    cellSize: 10,
    frequency: 5,
    isPlaying: false,
    selectedPreset: null,
    selectedPattern: null,
    width: 0,
    height: 0,
    centerRow: 0,
    centerColumn: 0,
    universe: this._timeline.pattern
  };

  /**
   * The timeout ID for the next game tick.
   *
   * @type {number}
   */
  _tickId = 0;

  /** @override */
  componentDidMount() {
    const resize = () => this.setState({width: window.innerWidth, height: window.innerHeight});
    window.addEventListener("resize", resize);
    resize();
  }

  /**
   * Plays the game if the game is paused, or pauses the game if the game is playing.
   */
  _playPause = () => {
    if (this.state.isPlaying) {
      window.clearTimeout(this._tickId);
      this.setState({isPlaying: false});
    } else {
      const tick = () => {
        if (this.state.isPlaying) {
          this._timeline.next();
          this.setState({universe: this._timeline.pattern});
          this._tickId = window.setTimeout(tick, 1000 / this.state.frequency);
        }
      };
      this.setState({isPlaying: true}, tick);
    }
  }

  /**
   * Handles keyup events.
   *
   * @param {KeyboardEvent} event - The keyup event.
   */
  _handleKeyUp = event => {
    if (event.key === " " && event.target.type !== "submit") {
      this._playPause();
    }
  }

  /**
   * Handles events for changing the game frequency.
   *
   * @param {ChangeEvent} event - The event for changing the game frequency.
   */
  _handleFrequencyChange = event => {
    const frequency = Math.max(FREQUENCY_MIN, Math.min(event.target.valueAsNumber, FREQUENCY_MAX));
    this.setState({frequency});
  }

  /**
   * Handles events for changing the cell size.
   *
   * @param {ChangeEvent} event - The event for changing the cell size.
   */
  _handleSizeChange = event => {
    this.setState({
      cellSize: Math.max(CELL_SIZE_MIN, Math.min(event.target.valueAsNumber, CELL_SIZE_MAX))
    });
  }

  /**
   * Handles events for changing the selected pattern preset.
   *
   * @param {?PatternPreset} preset - The new selected pattern preset or null to clear the selected
   * preset.
   */
  _handlePresetChange = preset => {
    if (preset !== null) {
      this.setState({
        selectedPreset: preset,
        selectedPattern: Pattern.fromPreset(preset).centered(
          Math.floor(this.state.centerRow),
          Math.floor(this.state.centerColumn)
        )
      });
    } else {
      this.setState({selectedPreset: null, selectedPattern: null});
    }
  }

  /**
   * Handles events for changing the centered cell.
   *
   * @param {number} row - The row of the new centered cell.
   * @param {number} column - The column of the new centered cell.
   */
  _handleCenterChange = (row, column) => {
    this.setState({centerRow: row, centerColumn: column});
  }

  /**
   * Handles events for moving the mouse on the board.
   *
   * @param {number} row - The row of the cell below the mouse pointer.
   * @param {number} column - The column of the cell below the mouse pointer.
   */
  _handleMouseMove = (row, column) => {
    if (this.state.selectedPattern !== null) {
      this.setState({selectedPattern: this.state.selectedPattern.centered(row, column)});
    }
  }

  /**
   * Handles events for clicking a cell on the board.
   *
   * @param {number} row - The row of the cell that was clicked.
   * @param {number} column - The column of the cell that was clicked.
   */
  _handleClick = (row, column) => {
    if (this.state.selectedPattern !== null) {
      this._timeline.replace(this.state.universe.merged(this.state.selectedPattern));
      this.setState({
        selectedPreset: null,
        selectedPattern: null,
        universe: this._timeline.pattern
      });
    } else {
      this._timeline.replace(
        this.state.universe.withCells([
          new Cell(row, column, !this.state.universe.cell(row, column).isAlive)
        ])
      );
      this.setState({
        isPlaying: false,
        universe: this._timeline.pattern
      });
    }
  }

  /**
   * Handles events for scrolling the mouse wheel on the board.
   *
   * @param {number} row - The row of the cell below the mouse pointer.
   * @param {number} column - The column of the cell below the mouse pointer.
   * @param {number} wheelX - The horizontal scroll amount.
   * @param {number} wheelY - The vertical scroll amount.
   */
  _handleWheel = (row, column, wheelX, wheelY) => {
    if (this.state.selectedPattern !== null) {
      // Rotate the selected pattern.
      this.setState({
        selectedPattern: this.state.selectedPattern.rotated(
          wheelY > 0 ? Rotation.COUNTERCLOCKWISE : Rotation.CLOCKWISE,
          row,
          column
        )
      });
    } else {
      // Change the cell size.
      const cellSize =
        wheelY > 0 ? Math.floor(this.state.cellSize / 1.1) : Math.ceil(this.state.cellSize * 1.1);
      this.setState({
        cellSize: Math.max(CELL_SIZE_MIN, Math.min(cellSize, CELL_SIZE_MAX))
      });
    }
  }

  /**
   * Moves to the next board state.
   */
  _next = () => {
    this._timeline.next();
    this.setState({isPlaying: false, universe: this._timeline.pattern});
  }

  /**
   * Moves to the previous board state.
   */
  _previous = () => {
    this._timeline.previous();
    this.setState({isPlaying: false, universe: this._timeline.pattern});
  }

  /**
   * Clears the board.
   */
  _clear = () => {
    if (!this.state.universe.isEmpty) {
      this._timeline.replace(new Pattern());
      this.setState({isPlaying: false, universe: this._timeline.pattern});
    }
  }

  /** @override */
  render() {
    return (
      <div tabIndex="-1" onKeyUp={this._handleKeyUp}>
        <div className="toolbar">
          <label className="item">
            <span>{this.state.frequency}×</span>
            <input
              type="range"
              min={FREQUENCY_MIN}
              max={FREQUENCY_MAX}
              step="1"
              value={this.state.frequency}
              onChange={this._handleFrequencyChange}
            />
          </label>

          <span className="item controls">
            <button disabled={!this._timeline.hasPrevious()} onClick={this._previous} title="Undo">
              <FontAwesomeIcon icon={faCaretLeft}/>
            </button>
            <button onClick={this._playPause} title={this.state.isPlaying ? "Pause" : "Play"}>
              <FontAwesomeIcon icon={this.state.isPlaying ? faPauseCircle : faPlayCircle}/>
            </button>
            <button onClick={this._next} title="Redo/Next">
              <FontAwesomeIcon icon={faCaretRight}/>
            </button>
          </span>

          <label className="item">
            <input
              type="range"
              min={CELL_SIZE_MIN}
              max={CELL_SIZE_MAX}
              step="1"
              value={this.state.cellSize}
              onChange={this._handleSizeChange}
            />
            <span>{this.state.cellSize}:1</span>
          </label>

          <button className="item right" onClick={this._clear} title="Clear">
            <FontAwesomeIcon icon={faFile}/>
          </button>
        </div>

        <div className="sidebar">
          <PatternPicker
            presets={patternPresets}
            selectedPreset={this.state.selectedPreset}
            onPresetChange={this._handlePresetChange}
          />
        </div>

        <Board
          width={this.state.width}
          height={this.state.height}
          cellSize={this.state.cellSize}
          centerRow={this.state.centerRow}
          centerColumn={this.state.centerColumn}
          pattern={this.state.universe}
          ghost={this.state.selectedPattern}
          onCenterChange={this._handleCenterChange}
          onMouseMove={this._handleMouseMove}
          onClick={this._handleClick}
          onWheel={this._handleWheel}
        />
      </div>
    );
  }
}
