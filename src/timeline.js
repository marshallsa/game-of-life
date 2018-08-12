import Pattern from "./pattern.js";

/**
 * An immutable record of a pattern's history as it evolves over time or is edited.
 */
export default class Timeline {
  /**
   * The present pattern.
   *
   * @type {Pattern}
   */
  _pattern = new Pattern();

  /**
   * The present generation number.
   *
   * @type {number}
   */
  _generation = 0;

  /**
   * The list of past patterns.
   *
   * @type {?Node}
   */
  _past = null;

  /**
   * The list of future patterns.
   *
   * @type {?Node}
   */
  _future = null;

  /**
   * The present pattern.
   *
   * @type {Pattern}
   */
  get pattern() {
    return this._pattern;
  }

  /**
   * The present generation number.
   *
   * @type {number}
   */
  get generation() {
    return this._generation;
  }

  /**
   * Returns a new timeline with the given pattern added after the present pattern. Any other future
   * patterns are removed from the timeline.
   *
   * @param {Pattern} pattern - The pattern to add.
   * @return {Timeline} The new timeline.
   */
  with(pattern) {
    const timeline = new Timeline();
    timeline._pattern = pattern;
    timeline._past = new Node(this._pattern, this._generation, this._past);
    return timeline;
  }

  /**
   * Returns a new timeline that is one pattern ahead of this timeline.
   *
   * @return {Timeline} The new timeline.
   */
  next() {
    if (this._future === null && this._pattern.empty) {
      return this;
    }

    if (this._future === null) {
      const timeline = new Timeline();
      timeline._pattern = this._pattern.next();
      timeline._generation = this._generation + 1;
      timeline._past = new Node(this._pattern, this._generation, this._past);
      return timeline;
    }

    const timeline = new Timeline();
    timeline._pattern = this._future.pattern;
    timeline._generation = this._future.generation;
    timeline._past = new Node(this._pattern, this._generation, this._past);
    timeline._future = this._future.next;
    return timeline;
  }

  /**
   * Returns a new timeline that is one pattern behind this timeline.
   *
   * @return {Timeline} The new timeline.
   */
  previous() {
    if (!this.hasPrevious()) {
      throw new Error("No previous pattern");
    }

    const timeline = new Timeline();
    timeline._pattern = this._past.pattern;
    timeline._generation = this._past.generation;
    timeline._past = this._past.next;
    timeline._future = new Node(this._pattern, this._generation, this._future);
    return timeline;
  }

  /**
   * Returns true if this timeline has any patterns before the present pattern, false otherwise.
   *
   * @return {Boolean} True if this timeline has any patterns before the present pattern, false
   * otherwise.
   */
  hasPrevious() {
    return this._past !== null;
  }
}

/**
 * An immutable singly-linked list node representing a pattern in the timeline.
 */
class Node {
  /**
   * Creates a new node.
   *
   * @param {Pattern} pattern - The pattern.
   * @param {number} generation - The generation number.
   * @param {?Node} next - The next node in the list.
   */
  constructor(pattern, generation, next) {
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
     * The next node in the list.
     *
     * @type {?Node}
     */
    this.next = next;

    Object.freeze(this);
  }
}
