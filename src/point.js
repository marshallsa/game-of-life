/**
 * A 2-dimensional point.
 */
export default class Point {
    /**
     * Creates a new point.
     *
     * @param {number} x - The x coordinate of the point.
     * @param {number} y - The y coordinate of the point.
     */
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    /**
     * Returns the x coordinate of the point.
     *
     * @return {number} The x coordinate of the point.
     */
    get x() {
        return this._x;
    }

    /**
     * Returns the y coordinate of the point.
     *
     * @return {number} The y coordinate of the point.
     */
    get y() {
        return this._y;
    }

    /**
     * Translates this point by x units horizontally and y units vertically and
     * returns the new point.
     *
     * @param {number} x - The number of units to translate horizontally.
     * @param {number} y - The number of units to translate vertically.
     * @return {Point} The translated point.
     */
    translate(x, y) {
        return new Point(this.x + x, this.y + y);
    }

    /**
     * Returns the distance from this point to the given point.
     *
     * @param {number} point - The point to calculate the distance to.
     * @return {number} The distance from this point to the given point.
     */
    distance(point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    }

    /**
     * Returns true if this point is equal to the given point, otherwise false.
     *
     * @param {Point} point - The point to check equality with.
     * @return {boolean} True if this point is equal to the given point,
     *     otherwise false.
     */
    equals(point) {
        return this.x == point.x && this.y == point.y;
    }
}
