import Drag from "./drag.js";

import React from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

/**
 * The background color of the board.
 *
 * @type {string}
 */
const BACKGROUND_COLOR = "#fff";

/**
 * The color of live cells.
 *
 * @type {string}
 */
const CELL_COLOR = "#000";

/**
 * The color of the ghost pattern's cells.
 *
 * @type {string}
 */
const GHOST_COLOR = "#aaa";

/**
 * The color of the gridlines.
 *
 * @type {string}
 */
const GRID_COLOR = "#eee";

/**
 * Shows a pattern on a board with cells arranged in a grid.
 */
export default class Board extends React.Component {
  /**
   * Default values for props.
   *
   * @type {Object}
   */
  static defaultProps = {
    centerRow: 0,
    centerColumn: 0,
    ghost: null,
    onCenterChange: () => {},
    onMouseMove: () => {},
    onClick: () => {},
    onWheel: () => {}
  };

  /**
   * The board's canvas ref.
   *
   * @type {Object}
   */
  _canvas = React.createRef();

  /**
   * The canvas's drawing context.
   *
   * @type {?CanvasRenderingContext2D}
   */
  _context = null;

  /**
   * Tracks the mouse when it's dragged across the board.
   *
   * @type {?Drag}
   */
  _drag = null;

  /**
   * The current mouse position, or null if the mouse isn't on the board.
   *
   * @type {?Object}
   * @property {number} x - The x coordinate of the mouse position.
   * @property {number} y - The y coordinate of the mouse position.
   */
  _mousePosition = null;

  /**
   * The current translation for the drawing context.
   *
   * @type {Object}
   * @property {number} x - The distance translated in the x direction.
   * @property {number} y - The distance translated in the y direction.
   */
  get _translation() {
    return {
      x: Math.round(this.props.width / 2 - this.props.centerColumn * this.props.cellSize),
      y: Math.round(this.props.height / 2 - this.props.centerRow * this.props.cellSize)
    };
  }

  /**
   * Creates a new board.
   *
   * @param {Object} props - The component props.
   * @param {number} props.width - The width of the board.
   * @param {number} props.height - The height of the board.
   * @param {number} props.cellSize - The size of each cell.
   * @param {?number} props.centerRow - The row of the cell at the center of the board.
   * @param {?number} props.centerColumn - The column of the cell at the center of the board.
   * @param {Pattern} props.pattern - The pattern to show.
   * @param {?Pattern} props.ghost - The ghost pattern to show over the normal pattern.
   * @param {?function(row: number, column: number)} props.onCenterChange - Called when the centered
   * cell changes.
   * @param {?function(row: number, column: number)} props.onMouseMove - Called when the mouse moves
   * over the board.
   * @param {?function(row: number, column: number)} props.onClick - Called when a cell on the board
   * is clicked.
   * @param {?function(row: number, column: number, wheelX: number, wheelY: number)} props.onWheel -
   * Called when the mouse wheel is scrolled on the board.
   */
  constructor(props) {
    super(props);
  }

  /** @override */
  componentDidMount() {
    this._context = this._canvas.current.getContext("2d");
    this._context.translate(this._translation.x, this._translation.y);
    this._draw();
  }

  /** @override */
  componentDidUpdate(prevProps) {
    const prevTranslation = {
      x: Math.round(prevProps.width / 2 - prevProps.centerColumn * prevProps.cellSize),
      y: Math.round(prevProps.height / 2 - prevProps.centerRow * prevProps.cellSize)
    };

    if (this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
      // Changing the width or height of the canvas resets the context's translation to (0, 0), so
      // translate it back.
      this._context.translate(this._translation.x, this._translation.y);
    } else {
      // Translate from the previous translation to the new one.
      this._context.translate(
        this._translation.x - prevTranslation.x,
        this._translation.y - prevTranslation.y
      );
    }

    // Keep the same cell below the mouse pointer after changing the cell size.
    if (this.props.cellSize !== prevProps.cellSize && this._mousePosition !== null) {
      const row = (this._mousePosition.y - prevTranslation.y) / prevProps.cellSize;
      const column = (this._mousePosition.x - prevTranslation.x) / prevProps.cellSize;
      this.props.onCenterChange(
        row - (this._mousePosition.y - prevProps.height / 2) / this.props.cellSize,
        column - (this._mousePosition.x - prevProps.width / 2) / this.props.cellSize
      );
    }

    this._draw();
  }

  /**
   * Handles mousedown events on the canvas.
   *
   * @param {MouseEvent} event - The mousedown event.
   */
  @autobind
  _handleMouseDown(event) {
    this._mousePosition = {x: event.clientX, y: event.clientY};
    if (event.button === 0) {
      this._drag = new Drag(event.clientX, event.clientY);
    }
  }

  /**
   * Handles mousemove events on the canvas.
   *
   * @param {MouseEvent} event - The mousemove event.
   */
  @autobind
  _handleMouseMove(event) {
    this._mousePosition = {x: event.clientX, y: event.clientY};

    // Pan the board if the mouse is dragged.
    if (event.buttons & 1) {
      this._drag = this._drag.to(event.clientX, event.clientY);
      if (this._drag.deltaX !== 0 || this._drag.deltaY !== 0) {
        this.props.onCenterChange(
          this.props.centerRow - this._drag.deltaY / this.props.cellSize,
          this.props.centerColumn - this._drag.deltaX / this.props.cellSize
        );
        this._canvas.current.style.cursor = "pointer";
      }
    }

    this.props.onMouseMove(
      Math.floor((event.clientY - this._translation.y) / this.props.cellSize),
      Math.floor((event.clientX - this._translation.x) / this.props.cellSize)
    );
  }

  /**
   * Handles mouseup events on the canvas.
   *
   * @param {MouseEvent} event - The mouseup event.
   */
  @autobind
  _handleMouseUp(event) {
    this._mousePosition = {x: event.clientX, y: event.clientY};

    if (event.button === 0 && !this._drag.moved) {
      this.props.onClick(
        Math.floor((event.clientY - this._translation.y) / this.props.cellSize),
        Math.floor((event.clientX - this._translation.x) / this.props.cellSize)
      );
    }

    this._drag = null;
    this._canvas.current.style.cursor = "";
  }

  /**
   * Handles wheel events on the canvas.
   *
   * @param {WheelEvent} event - The wheel event.
   */
  @autobind
  _handleWheel(event) {
    this._mousePosition = {x: event.clientX, y: event.clientY};
    this.props.onWheel(
      Math.floor((event.clientY - this._translation.y) / this.props.cellSize),
      Math.floor((event.clientX - this._translation.x) / this.props.cellSize),
      event.deltaX,
      event.deltaY
    );
  }

  /**
   * Handles mouseout events on the canvas.
   *
   * @param {MouseEvent} event - The mouseout event.
   */
  @autobind
  _handleMouseOut(event) {
    this._mousePosition = null;
  }

  /**
   * Draws the board.
   */
  _draw() {
    this._context.fillStyle = BACKGROUND_COLOR;
    this._context.fillRect(
      -this._translation.x - 0.5,
      -this._translation.y - 0.5,
      this.props.width + 0.5,
      this.props.height + 0.5
    );

    this._drawCells(this.props.pattern.liveCells(), CELL_COLOR);
    if (this.props.ghost !== null) {
      this._drawCells(this.props.ghost.liveCells(), GHOST_COLOR);
    }
    if (this.props.cellSize >= 10) {
      this._drawGridlines();
    }
  }

  /**
   * Draws the given cells.
   *
   * @param {Iterable<Cell>} cells - The cells to draw.
   * @param {string} color - The color of the cells.
   */
  _drawCells(cells, color) {
    this._context.fillStyle = color;
    for (const cell of cells) {
      this._context.fillRect(
        cell.column * this.props.cellSize,
        cell.row * this.props.cellSize,
        this.props.cellSize,
        this.props.cellSize
      );
    }
  }

  /**
   * Draws the gridlines.
   */
  _drawGridlines() {
    this._context.lineWidth = 1;
    this._context.strokeStyle = GRID_COLOR;

    const topLine = Math.floor(-this._translation.y / this.props.cellSize) * this.props.cellSize;
    const bottomLine =
      topLine + Math.ceil(this.props.height / this.props.cellSize) * this.props.cellSize;
    const leftLine = Math.floor(-this._translation.x / this.props.cellSize) * this.props.cellSize;
    const rightLine =
      leftLine + Math.ceil(this.props.width / this.props.cellSize) * this.props.cellSize;

    // Draw the vertical gridlines.
    for (let i = leftLine; i <= rightLine; i += this.props.cellSize) {
      this._context.beginPath();
      this._context.moveTo(i - 0.5, topLine - 0.5);
      this._context.lineTo(i - 0.5, topLine + this.props.height + this.props.cellSize + 0.5);
      this._context.stroke();
    }

    // Draw the horizontal gridlines.
    for (let j = topLine; j <= bottomLine; j += this.props.cellSize) {
      this._context.beginPath();
      this._context.moveTo(leftLine - 0.5, j - 0.5);
      this._context.lineTo(leftLine + this.props.width + this.props.cellSize + 0.5, j - 0.5);
      this._context.stroke();
    }
  }

  /** @override */
  render() {
    return (
      <canvas
        ref={this._canvas}
        width={this.props.width}
        height={this.props.height}
        onMouseDown={this._handleMouseDown}
        onMouseMove={this._handleMouseMove}
        onMouseUp={this._handleMouseUp}
        onWheel={this._handleWheel}
        onMouseOut={this._handleMouseOut}
      />
    );
  }
}
