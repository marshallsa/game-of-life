import Pattern from "./pattern.js";
import PatternPreview from "./patternpreview.js";

import React from "react";

/**
 * Lets the user pick a pattern from a list.
 */
export default class PatternPicker extends React.Component {
  /**
   * Creates a new PatternPicker.
   *
   * @param {Object} props - The component props.
   * @param {PatternProperties[]} props.patterns - The list of each pattern's properties.
   * @param {?PatternProperties} props.pattern - The selected pattern's properties, or null if no
   * pattern is selected.
   * @param {function(pattern: PatternProperties)} props.onPatternChange - Called when the selected
   * pattern changes.
   */
  constructor(props) {
    super(props);
  }

  /**
   * Returns true if the given pattern is selected, false otherwise.
   *
   * @param {PatternProperties} pattern - The pattern's properties.
   * @return {boolean} True if the given pattern is selected, false otherwise.
   */
  _selected(pattern) {
    return this.props.pattern && this.props.pattern.name == pattern.name;
  }

  /** @override */
  render() {
    return (
      <ul className="patterns">
        {this.props.patterns.map(pattern =>
          <li
            key={pattern.name}
            className={this._selected(pattern) ? "selected" : ""}
            onClick={() => this.props.onPatternChange(this._selected(pattern) ? null : pattern)}
          >
            <PatternPreview width="50" height="50" pattern={Pattern.fromRle(pattern.rle)}/>
            <span class="name">{pattern.name}</span>
            {pattern.author && <span class="author">{pattern.author}</span>}
            <span class="description">
              {pattern.description + " "}
              {pattern.url &&
                <a
                  href={pattern.url}
                  target="_blank"
                  onClick={(event) => event.stopPropagation()}
                >Read more</a>
              }
            </span>
          </li>
        )}
      </ul>
    );
  }
}
