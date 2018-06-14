import Point from "./point.js";

/**
 * The distance in pixels that the mouse needs to move after being clicked to
 * start dragging.
 *
 * @type {number}
 */
const DRAG_THRESHOLD = 5;

/**
 * A dragging motion that starts where the mouse is clicked and ends at the
 * mouse's current position.
 */
export default class DragMotion {
    /**
     * Creates a new dragging motion that starts at the given point.
     *
     * @param {number} x - The starting x coordinate.
     * @param {number} y - The starting y coordinate.
     */
    constructor(x, y) {
        this._start = new Point(x, y);
        this._last = null;
        this._dragging = false;
    }

    /**
     * Updates the position of the mouse in the dragging motion and returns the
     * delta from the last position. If the mouse hasn't moved past the drag
     * threshold yet, the delta will be [0, 0].
     *
     * @param {number} x - The current x coordinate of the mouse.
     * @param {number} y - The current y coordinate of the mouse.
     * @return {number[]} The delta [dx, dy] from the last mouse position.
     */
    update(x, y) {
        if (!this._dragging) {
            if (this._start.distance(new Point(x, y)) >= DRAG_THRESHOLD) {
                this._start = new Point(x, y);
                this._last = new Point(x, y);
                this._dragging = true;
            }
            return [0, 0];
        }

        let dx = x - this._last.x;
        let dy = y - this._last.y;
        this._last = new Point(x, y);
        return [dx, dy];
    }

    /**
     * True if the mouse has moved past the drag threshold yet, false otherwise.
     *
     * @type {boolean}
     */
    get moved() {
        return this._dragging && !this._start.equals(this._last);
    }
}
