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
 * The main toolbar for the Game of Life.
 */
export default class Toolbar extends React.Component {
  /**
   * Creates a new toolbar.
   *
   * @param {Object} props - The component props.
   * @param {number} props.frequency - The frequency of the game tick in Hertz.
   * @param {number} props.frequencyMin - The minimum frequency of the game tick in Hertz.
   * @param {number} props.frequencyMax - The maximum frequency of the game tick in Hertz.
   * @param {number} props.cellSize - The width and height of each cell in pixels.
   * @param {number} props.cellSizeMin - The minimum width and height of each cell in pixels.
   * @param {number} props.cellSizeMax - The maximum width and height of each cell in pixels.
   * @param {boolean} props.canUndo - True if the board has a previous state, false otherwise.
   * @param {boolean} props.isPlaying - True if the game is playing, false otherwise.
   * @param {function(frequency: number)} props.onFrequencyChange - Called when the frequency
   * changes.
   * @param {function(cellSize: number)} props.onSizeChange - Called when the cell size changes.
   * @param {function()} props.onUndo - Called when the undo button is clicked.
   * @param {function()} props.onPlayPause - Called when the play/pause button is clicked.
   * @param {function()} props.onRedo - Called when the redo/next button is clicked.
   * @param {function()} props.onClear - Called when the clear button is clicked.
   */
  constructor(props) {
    super(props);
  }

  /**
   * Handles events for changing the frequency.
   *
   * @param {ChangeEvent} event - The event for changing the frequency.
   */
  _handleFrequencyChange = event => {
    this.props.onFrequencyChange(event.target.valueAsNumber);
  }

  /**
   * Handles events for changing the cell size.
   *
   * @param {ChangeEvent} event - The event for changing the cell size.
   */
  _handleSizeChange = event => {
    this.props.onSizeChange(event.target.valueAsNumber);
  }

  /** @override */
  render() {
    return (
      <div className="toolbar">
        <label className="item">
          <span>{this.props.frequency}×</span>
          <input
            type="range"
            min={this.props.frequencyMin}
            max={this.props.frequencyMax}
            step="1"
            value={this.props.frequency}
            onChange={this._handleFrequencyChange}
          />
        </label>

        <span className="item controls">
          <button disabled={!this.props.canUndo} onClick={this.props.onUndo} title="Undo">
            <FontAwesomeIcon icon={faCaretLeft}/>
          </button>
          <button onClick={this.props.onPlayPause} title={this.props.isPlaying ? "Pause" : "Play"}>
            <FontAwesomeIcon icon={this.props.isPlaying ? faPauseCircle : faPlayCircle}/>
          </button>
          <button onClick={this.props.onRedo} title="Redo/Next">
            <FontAwesomeIcon icon={faCaretRight}/>
          </button>
        </span>

        <label className="item">
          <input
            type="range"
            min={this.props.cellSizeMin}
            max={this.props.cellSizeMax}
            step="1"
            value={this.props.cellSize}
            onChange={this._handleSizeChange}
          />
          <span>{this.props.cellSize}:1</span>
        </label>

        <button className="item right" onClick={this.props.onClear} title="Clear">
          <FontAwesomeIcon icon={faFile}/>
        </button>
      </div>
    );
  }
}
