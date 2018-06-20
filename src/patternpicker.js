import Pattern from "./pattern.js";
import PatternPreview from "./patternpreview.js";

import React from "react";
import ReactPaginate from "react-paginate";

/**
 * The number of pattern presets shown on each page.
 *
 * @type {number}
 */
const PAGE_SIZE = 20;

/**
 * Lets the user pick a pattern from a list of presets.
 */
export default class PatternPicker extends React.Component {
  /**
   * The pattern picker's state.
   *
   * @override
   * @private
   * @type {Object}
   * @property {number} page - The current page in the list of pattern presets.
   */
  state = {page: 0};

  /**
   * Creates a new pattern picker.
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
    let pagePresets = this.props.presets.slice(
      this.state.page * PAGE_SIZE,
      (this.state.page + 1) * PAGE_SIZE
    );
    let listItems = pagePresets.map(preset =>
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
            <a href={preset.url} target="_blank" onClick={(event) => event.stopPropagation()}>
              Read more
            </a>
          }
        </span>
      </li>
    );

    return (
      <div className="pattern-picker">
        <ul className="patterns">{listItems}</ul>
        {this.props.presets.length > PAGE_SIZE &&
          <ReactPaginate
            pageCount={Math.ceil(this.props.presets.length / PAGE_SIZE)}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            onPageChange={page => this.setState({page: page.selected})}
            containerClassName="pages"
          />
        }
      </div>
    );
  }
}
