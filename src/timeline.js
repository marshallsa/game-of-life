import Pattern from "./pattern.js";

/**
 * The maximum number of patterns that the timeline can hold.
 *
 * @type {number}
 */
const MAX_SIZE = 1000;

/**
 * A record of a pattern's history as it evolves over time or is edited.
 */
export default class Timeline {
  /**
   * The present node in the timeline.
   *
   * @type {Node}
   */
  _present = new Node(new Pattern(), 0);

  /**
   * The oldest node in the timeline.
   *
   * @type {Node}
   */
  _beginning = this._present;

  /**
   * The number of nodes in the entire timeline.
   *
   * @type {number}
   */
  _size = 1;

  /**
   * The number of nodes in the future part of the timeline.
   *
   * @type {number}
   */
  _futureSize = 0;

  /**
   * The present pattern.
   *
   * @type {Pattern}
   */
  get pattern() {
    return this._present.pattern;
  }

  /**
   * The present generation number.
   *
   * @type {number}
   */
  get generation() {
    return this._present.generation;
  }

  /**
   * Replaces the next pattern with the given pattern and moves to the next pattern in the new
   * timeline. The generation number is reset to zero.
   *
   * @param {Pattern} pattern - The pattern to replace the next pattern with.
   */
  replace(pattern) {
    this._replace(pattern, 0);
  }

  /**
   * Moves to the next pattern in the timeline.
   */
  next() {
    if (this._present.next !== null) {
      this._present = this._present.next;
      this._futureSize--;
    } else if (!this._present.pattern.isEmpty) {
      this._replace(this.pattern.next(), this.generation + 1);
    }
  }

  /**
   * Moves to the previous pattern in the timeline.
   */
  previous() {
    if (!this.hasPrevious()) {
      throw new Error("No previous pattern");
    }

    this._present = this._present.previous;
    this._futureSize++;
  }

  /**
   * Returns true if this timeline has any patterns before the present pattern, false otherwise.
   *
   * @return {Boolean} True if this timeline has any patterns before the present pattern, false
   * otherwise.
   */
  hasPrevious() {
    return this._present.previous !== null;
  }

  /**
   * Replaces the next pattern and generation number with the given pattern and generation number
   * and moves to the next pattern in the new timeline.
   *
   * @param {Pattern} pattern - The pattern to replace the next pattern with.
   * @param {number} generation - The generation number for the pattern.
   */
  _replace(pattern, generation) {
    // Create a new node that replaces all of the future nodes.
    this._present.next = new Node(pattern, generation, this._present);
    this._present = this._present.next;
    this._size -= this._futureSize;
    this._futureSize = 0;

    if (this._size === MAX_SIZE) {
      // Remove the oldest node.
      this._beginning.next.previous = null;
      this._beginning = this._beginning.next;
    } else {
      this._size++;
    }
  }
}

/**
 * A doubly-linked list node representing a pattern in the timeline.
 */
class Node {
  /**
   * Creates a new node.
   *
   * @param {Pattern} pattern - The pattern.
   * @param {number} generation - The generation number.
   * @param {?Node} [previous=null] - The previous node in the list.
   * @param {?Node} [next=null] - The next node in the list.
   */
  constructor(pattern, generation, previous = null, next = null) {
    /**
     * The pattern.
     *
     * @type {Pattern}
     */
    this.pattern = pattern;

    /**
     * The generation number.
     *
     * @type {number}
     */
    this.generation = generation;

    /**
     * The previous node in the list.
     *
     * @type {?Node}
     */
    this.previous = previous;

    /**
     * The next node in the list.
     *
     * @type {?Node}
     */
    this.next = next;
  }
}
