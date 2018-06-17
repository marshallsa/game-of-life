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
     * @param {Pattern[]} props.patterns - The list of patterns.
     * @param {?Pattern} props.pattern - The selected pattern, or null if no
     *     pattern is selected.
     * @param {function(pattern: Pattern)} props.onPatternChange - Called when
     *     the selected pattern changes.
     */
    constructor(props) {
        super(props);
    }

    /**
     * Returns true if the given pattern is selected, false otherwise.
     *
     * @param {Pattern} pattern - The pattern to check.
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
                    <li key={pattern.name}>
                        <a
                            className={this._selected(pattern) ? "selected" : ""}
                            onClick={() => this.props.onPatternChange(this._selected(pattern) ? null : pattern)}
                        >
                            <PatternPreview width="50" height="50" pattern={pattern}/>
                            {pattern.name}
                        </a>
                    </li>
                )}
            </ul>
        );
    }
}
