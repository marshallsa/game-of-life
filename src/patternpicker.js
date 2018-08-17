import Board from "./board.js";
import Pattern from "./pattern.js";

import React from "react";

import {faCaretDown} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

/**
 * A map of search strings to their category names.
 *
 * @type {Map<string, string>}
 */
const CATEGORIES = new Map([
  ["favorite", "Favorites"],
  ["still life", "Still Lifes"],
  ["oscillator", "Oscillators"],
  ["spaceship", "Spaceships"],
  ["puffer", "Puffers"],
  ["gun", "Guns"],
  ["methuselah", "Methuselahs"],
  ["wick", "Wicks"],
  ["all", "All"]
]);

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
   * @property {string} search - The search filter.
   * @property {string} category - The category filter.
   */
  state = {search: "", category: "favorite"};

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
   * Returns true if the given pattern preset is selected, false otherwise.
   *
   * @param {PatternPreset} preset - The pattern preset.
   * @return {boolean} True if the given pattern preset is selected, false otherwise.
   */
  _isSelected(preset) {
    return this.props.selectedPreset && this.props.selectedPreset.name === preset.name;
  }

  /**
   * Selects or deselects the given pattern preset
   *
   * @param {PatternPreset} preset - The pattern preset to select or deselect.
   */
  _togglePreset = preset => {
    if (this._isSelected(preset)) {
      this.props.onPresetChange(null);
    } else {
      this.props.onPresetChange(preset);
    }
  }

  /**
   * Handles change events for the category filter.
   *
   * @param {ChangeEvent} event - The change event.
   */
  _handleCategoryChange = event => {
    this.setState({category: event.target.value});
    this._presetList.current.scrollTop = 0;
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

    return (
      <div className="pattern-picker">
        <div className="search-bar">
          <span className="category-menu">
            {CATEGORIES.get(this.state.category)}
            <FontAwesomeIcon icon={faCaretDown}/>
            <select value={this.state.category} onChange={this._handleCategoryChange}>
              {Array.from(CATEGORIES).map(([value, name]) =>
                <option value={value}>{name}</option>
              )}
            </select>
          </span>

          <input
            placeholder="Search"
            value={this.state.search}
            onChange={event => this.setState({search: event.target.value})}
          />
        </div>

        <ul className="patterns" ref={this._presetList}>
          {filteredPresets.map(preset =>
            <PatternListItem
              key={preset.name}
              preset={preset}
              className={this._isSelected(preset) ? "selected" : ""}
              onClick={this._togglePreset}
            />
          )}
        </ul>
      </div>
    );
  }
}

/**
 * A list item showing the details of a pattern preset.
 */
class PatternListItem extends React.PureComponent {
  /**
   * Creates a new pattern list item.
   *
   * @param {Object} props - The component props.
   * @param {PatternPreset} props.preset - The pattern preset to show.
   * @param {?string} props.className - The class name of the list item.
   * @param {function(preset: PatternPreset)} props.onClick - The click event handler for the list
   * item.
   */
  constructor(props) {
    super(props);
  }

  /** @override */
  render() {
    return (
      <li className={this.props.className} onClick={() => this.props.onClick(this.props.preset)}>
        <PatternPreview width={50} height={50} pattern={Pattern.fromPreset(this.props.preset)}/>
        <span className="name">{this.props.preset.name}</span>
        {this.props.preset.author !== "" &&
          <span className="author">{this.props.preset.author}</span>
        }
        <span className="description">
          {this.props.preset.description + " "}
          {this.props.preset.url !== "" &&
            <a
              href={this.props.preset.url}
              target="_blank"
              onClick={(event) => event.stopPropagation()}
            >
              Read more
            </a>
          }
        </span>
      </li>
    );
  }
}

/**
 * Shows a preview of a pattern.
 *
 * @param {Object} props - The component props.
 * @param {Pattern} props.pattern - The pattern to show.
 * @param {number} props.width - The width of the preview.
 * @param {number} props.height - The height of the preview.
 */
function PatternPreview(props) {
  const cellSize = Math.floor(
    Math.min(
      props.width / props.pattern.width,
      props.height / props.pattern.height
    )
  );

  return (
    <Board
      width={props.width}
      height={props.height}
      cellSize={cellSize}
      centerRow={props.pattern.height % 2 !== 0 ? 0.5 : 0}
      centerColumn={props.pattern.width % 2 !== 0 ? 0.5 : 0}
      pattern={props.pattern.centered(0, 0)}
    />
  );
}
