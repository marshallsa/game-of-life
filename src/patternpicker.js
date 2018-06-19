import Pattern from "./pattern.js";
import PatternPreview from "./patternpreview.js";

import React from "react";

/**
 * Lets the user pick a pattern from a list of presets.
 */
export default class PatternPicker extends React.Component {
  /**
   * Creates a new PatternPicker.
   *
   * @param {Object} props - The component props.
   * @param {PatternPreset[]} props.presets - The list of pattern presets.
   * @param {?PatternPreset} props.selectedPreset - The selected pattern preset, or null if no
   * preset is selected.
   * @param {function(selectedPreset: PatternPreset)} props.onPresetChange - Called when the
   * selected pattern preset changes.
   */
  constructor(props) {
    super(props);
  }

  /**
   * Returns true if the given pattern preset is selected, false otherwise.
   *
   * @param {PatternPreset} preset - The pattern preset.
   * @return {boolean} True if the given pattern preset is selected, false otherwise.
   */
  _selected(preset) {
    return this.props.selectedPreset && this.props.selectedPreset.name == preset.name;
  }

  /** @override */
  render() {
    return (
      <ul className="patterns">
        {this.props.presets.map(preset =>
          <li
            key={preset.name}
            className={this._selected(preset) ? "selected" : ""}
            onClick={() => this.props.onPresetChange(this._selected(preset) ? null : preset)}
          >
            <PatternPreview width="50" height="50" pattern={Pattern.fromPreset(preset)}/>
            <span className="name">{preset.name}</span>
            {preset.author && <span className="author">{preset.author}</span>}
            <span className="description">
              {preset.description + " "}
              {preset.url &&
                <a
                  href={preset.url}
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
