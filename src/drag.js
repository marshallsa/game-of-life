/**
 * Calculates changes in position as the mouse is dragged. `Drag` objects are immutable.
 */
export default class Drag {
  /**
   * The change in position since the last update.
   *
   * @type {Object}
   * @property {number} x - The change in the position's x coordinate.
   * @property {number} y - The change in the position's y coordinate.
   */
  _delta = {x: 0, y: 0};

  /**
   * True if the mouse has moved far enough from the starting position to activate the drag, false
   * otherwise.
   *
   * @type {boolean}
   */
  _active = false;

  /**
   * True if the mouse has moved since the drag was activated.
   *
   * @type {number}
   */
  _moved = false;

  /**
   * Creates a new `Drag` object.
   *
   * @param {number} x - The starting position's x coordinate.
   * @param {number} y - The starting position's y coordinate.
   * @param {number} [wiggle=5] - The number of pixels that the mouse needs to be moved away from
   * the starting position before the drag is activated.
   * @throws {RangeError} If wiggle is negative.
   */
  constructor(x, y, wiggle = 5) {
    if (wiggle < 0) {
      throw new RangeError("wiggle must be non-negative");
    }

    /**
     * The mouse's starting position.
     *
     * @type {Object}
     * @property {number} x - The starting position's x coordinate.
     * @property {number} y - The starting position's y coordinate.
     */
    this._start = {x, y};

    /**
     * The mouse's most recent position.
     *
     * @type {Object}
     * @property {number} x - The most recent position's x coordinate.
     * @property {number} y - The most recent position's y coordinate.
     */
    this._end = {x, y};

    /**
     * The number of pixels that the mouse needs to be moved away from the starting position before
     * the drag is activated.
     *
     * @type {number}
     */
    this._wiggle = wiggle;
  }

  /**
   * The change in the mouse position's x coordinate since the last update.
   *
   * @type {number}
   */
  get deltaX() {
    return this._delta.x;
  }

  /**
   * The change in the mouse position's y coordinate since the last update.
   *
   * @type {number}
   */
  get deltaY() {
    return this._delta.y;
  }

  /**
   * True if the mouse has moved since the drag was activated.
   *
   * @type {number}
   */
  get moved() {
    return this._moved;
  }

  /**
   * Returns a new `Drag` object that corresponds to the mouse being moved to the given position.
   *
   * @param {number} x - The new mouse position's x coordinate.
   * @param {number} y - The new mouse position's y coordinate.
   * @return {Drag} The new `Drag` object.
   */
  to(x, y) {
    if (this._active) {
      const drag = new Drag();
      drag._start = this._start;
      drag._end = {x, y};
      drag._delta = {x: x - this._end.x, y: y - this._end.y};
      drag._active = true;
      drag._moved = true;
      return drag;
    }

    if (distance(this._end.x, this._end.y, x, y) >= this._wiggle) {
      const drag = new Drag();
      drag._start = {x, y};
      drag._end = {x, y};
      drag._active = true;
      return drag;
    }

    return this;
  }
}

/**
 * Returns the distance between two points.
 *
 * @param {number} x1 - The x coordinate of the first point.
 * @param {number} y1 - The y coordinate of the first point.
 * @param {number} x2 - The x coordinate of the second point.
 * @param {number} y2 - The y coordinate of the second point.
 * @return {number} The distance between the two points.
 */
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
