import Pattern from "./pattern.js";

/**
 * An immutable record of a pattern's history as it evolves over time or is edited.
 */
export default class Timeline {
  /**
   * The list of patterns in the timeline.
   *
   * @type {Object[]}
   */
  _patterns = [
    {
      generation: 0,
      pattern: new Pattern()
    }
  ];

  /**
   * The index of the current pattern.
   *
   * @type {number}
   */
  _index = this._patterns.length - 1;

  /**
   * The generation number of the current pattern.
   *
   * @type {number}
   */
  get generation() {
    return this._patterns[this._index].generation;
  }

  /**
   * The current pattern.
   *
   * @type {Pattern}
   */
  get pattern() {
    return this._patterns[this._index].pattern;
  }

  /**
   * The number of patterns in the timeline before the current pattern.
   *
   * @type {number}
   */
  get patternsBefore() {
    return this._index;
  }

  /**
   * The number of patterns in the timeline after the current pattern.
   *
   * @type {number}
   */
  get patternsAfter() {
    return this._patterns.length - this._index - 1;
  }

  /**
   * Returns a new timeline with the given pattern added after the current pattern. Any other future
   * patterns are removed from the timeline.
   *
   * @param {Pattern} pattern - The pattern to add.
   * @return {Timeline} The new timeline.
   */
  with(pattern) {
    const timeline = new Timeline();
    timeline._patterns = [
      ...this._patterns.slice(0, this._index + 1),
      {generation: 0, pattern: pattern}
    ];
    timeline._index = timeline._patterns.length - 1;
    return timeline;
  }

  /**
   * Returns a new timeline that is one pattern ahead of this timeline.
   *
   * @return {Timeline} The new timeline.
   */
  next() {
    const timeline = new Timeline();

    if (this.patternsAfter === 0 && this.pattern.empty) {
      return this;
    } else if (this.patternsAfter === 0) {
      timeline._patterns = [
        ...this._patterns,
        {
          generation: this.generation + 1,
          pattern: this.pattern.next()
        }
      ];
      timeline._index = timeline._patterns.length - 1;
    } else {
      timeline._patterns = this._patterns;
      timeline._index = this._index + 1;
    }

    return timeline;
  }

  /**
   * Returns a new timeline that is one pattern behind this timeline.
   *
   * @return {Timeline} The new timeline.
   */
  previous() {
    if (this.entriesBefore === 0) {
      throw new Error("No previous pattern");
    }

    const timeline = new Timeline();
    timeline._patterns = this._patterns;
    timeline._index = this._index - 1;
    return timeline;
  }
}
