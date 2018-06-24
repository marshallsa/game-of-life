import Board from "./board.js";
import Grid from "./grid.js";

import React from "react";

/**
 * Shows a picture preview of a pattern.
 */
export default class PatternPreview extends React.Component {
  /**
   * The canvas that shows the pattern.
   *
   * @type {Object}
   */
  _canvas = React.createRef();

  /**
   * Creates a new PatternPreview.
   *
   * @param {Object} props - The component props.
   * @param {Pattern} props.pattern - The pattern to show.
   * @param {number} props.width - The width of the preview.
   * @param {number} props.height - The height of the preview.
   */
  constructor(props) {
    super(props);
  }

  /** @override */
  componentDidMount() {
    const board = new Board();
    board.add(this.props.pattern.center(0, 0));

    // Zoom to fit the whole pattern in the preview.
    const grid = new Grid(board, this._canvas.current);
    const cellSize = Math.floor(Math.min(
      this.props.width / this.props.pattern.width,
      this.props.height / this.props.pattern.height
    ));
    grid.zoom(cellSize, 0, 0);

    // Center the pattern.
    const dx = (this.props.width - (this.props.pattern.width % 2 !== 0 ? cellSize : 0)) / 2;
    const dy = (this.props.height - (this.props.pattern.height % 2 !== 0 ? cellSize : 0)) / 2;
    grid.translate(Math.round(dx), Math.round(dy));
    grid.draw();
  }

  /** @override */
  render() {
    return <canvas ref={this._canvas} width={this.props.width} height={this.props.height}/>;
  }
}
