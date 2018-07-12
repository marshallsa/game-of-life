import Pattern from "./pattern.js";
import PatternPreview from "./patternpreview.js";

import React from "react";
import ReactPaginate from "react-paginate";

import autobind from "autobind-decorator";

/**
 * The number of pattern presets shown on each page.
 *
 * @type {number}
 */
const PAGE_SIZE = 20;

/**
 * The names of the favorite pattern presets.
 *
 * @type {string[]}
 */
const FAVORITES = Object.freeze([
  "Beacon",
  "Beehive",
  "Blinker",
  "Block",
  "Boat",
  "Eater 1",
  "Figure eight",
  "Glider",
  "Gosper glider gun",
  "Lightweight spaceship",
  "Loaf",
  "Lobster (spaceship)",
  "Pentadecathlon",
  "Puffer 1",
  "Pulsar",
  "Queen bee shuttle",
  "R-pentomino",
  "Space rake",
  "Toad",
  "Tub"
]);

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
   * @property {string} search - The current search string.
   * @property {string} category - The current category.
   */
  state = {page: 0, search: "", category: "favorite"};

  /**
   * The DOM element for the list of pattern presets.
   *
   * @type {Object}
   */
  _presetList = React.createRef();

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
   * Changes the current page.
   *
   * @param {Object} page - The new page.
   */
  @autobind
  changePage(page) {
    this.setState({page: page.selected});
    this._presetList.current.scrollTop = 0;
  }

  /**
   * Returns true if the given pattern preset is selected, false otherwise.
   *
   * @param {PatternPreset} preset - The pattern preset.
   * @return {boolean} True if the given pattern preset is selected, false otherwise.
   */
  _selected(preset) {
    return this.props.selectedPreset && this.props.selectedPreset.name === preset.name;
  }

  /** @override */
  render() {
    const lowerCaseSearch = this.state.search.toLowerCase();
    const filteredPresets = this.props.presets
      .filter(preset =>
        this.state.category === "all"
        || (this.state.category === "favorite" && FAVORITES.includes(preset.name))
        || preset.name.toLowerCase().includes(this.state.category)
        || preset.description.toLowerCase().includes(this.state.category)
      )
      .filter(preset =>
        preset.name.toLowerCase().includes(lowerCaseSearch)
        || preset.author.toLowerCase().includes(lowerCaseSearch)
        || preset.description.toLowerCase().includes(lowerCaseSearch)
      );

    const currentPagePresets = filteredPresets.slice(
      this.state.page * PAGE_SIZE,
      (this.state.page + 1) * PAGE_SIZE
    );

    return (
      <div className="pattern-picker">
        <div class="search-bar">
          <select
            value={this.state.category}
            onChange={(event) => this.setState({page: 0, category: event.target.value})}
          >
            <option value="favorite">Favorites</option>
            <option value="still life">Still Lifes</option>
            <option value="oscillator">Oscillators</option>
            <option value="spaceship">Spaceships</option>
            <option value="puffer">Puffers</option>
            <option value="gun">Guns</option>
            <option value="methuselah">Methuselahs</option>
            <option value="wick">Wicks</option>
            <option value="all">All</option>
          </select>

          <input
            placeholder="Search"
            value={this.state.search}
            onChange={event => this.setState({page: 0, search: event.target.value})}
          />
        </div>

        <ul className="patterns" ref={this._presetList}>
          {currentPagePresets.map(preset =>
            <PatternListItem
              key={preset.name}
              preset={preset}
              className={this._selected(preset) ? "selected" : ""}
              onClick={() => this.props.onPresetChange(this._selected(preset) ? null : preset)}
            />
          )}
        </ul>

        {filteredPresets.length > PAGE_SIZE &&
          <ReactPaginate
            pageCount={Math.ceil(filteredPresets.length / PAGE_SIZE)}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            onPageChange={this.changePage}
            containerClassName="pages"
          />
        }
      </div>
    );
  }
}

/**
 * A list item showing the details of a pattern preset.
 *
 * @param {Object} props - The component props.
 * @param {PatternPreset} props.preset - The pattern preset to show.
 * @param {?string} props.className - The class name of the list item.
 * @param {function(event: MouseEvent)} props.onClick - The click event handler for the list item.
 * @return A list item showing the details of the given pattern preset.
 */
function PatternListItem(props) {
  return (
    <li className={props.className} onClick={props.onClick}>
      <PatternPreview width={50} height={50} pattern={Pattern.fromPreset(props.preset)}/>
      <span className="name">{props.preset.name}</span>
      {props.preset.author !== "" && <span className="author">{props.preset.author}</span>}
      <span className="description">
        {props.preset.description + " "}
        {props.preset.url !== "" &&
          <a href={props.preset.url} target="_blank" onClick={(event) => event.stopPropagation()}>
            Read more
          </a>
        }
      </span>
    </li>
  );
}
