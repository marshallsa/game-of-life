import Cell from "./cell.js";

import dropWhile from "lodash-es/dropWhile";
import takeWhile from "lodash-es/takeWhile";

/**
 * An enum of rotational directions.
 *
 * @type {Object}
 * @property {symbol} CLOCKWISE - Clockwise rotation.
 * @property {symbol} COUNTERCLOCKWISE - Counterclockwise rotation.
 */
export const Rotation = Object.freeze({
  CLOCKWISE: Symbol("CLOCKWISE"),
  COUNTERCLOCKWISE: Symbol("COUNTERCLOCKWISE")
});

/**
 * A pattern is a collection of cells.
 */
export default class Pattern {
  /**
   * Creates a new pattern.
   *
   * @param {Cell[]} cells - The cells that make up the pattern.
   */
  constructor(cells, name) {
    this._liveCells = cells.filter(cell => cell.alive);
  }

  /**
   * The width of this pattern. The width is the number of cells spanned from
   * the leftmost live cell to the rightmost live cell.
   *
   * @type {number}
   */
  get width() {
    let columns = this._liveCells.map(cell => cell.column);
    return Math.max(...columns) - Math.min(...columns) + 1;
  }

  /**
   * The height of this pattern. The height is the number of cells spanned
   * from the topmost live cell to the bottommost live cell.
   *
   * @type {number}
   */
  get height() {
    let rows = this._liveCells.map(cell => cell.row);
    return Math.max(...rows) - Math.min(...rows) + 1;
  }

  /**
   * Returns a copy of this pattern centered at the given row and column.
   *
   * @param {number} row - The new row the pattern is centered on.
   * @param {number} column - The new column the pattern is centered on.
   * @return {Pattern} A copy of this pattern centered at the given row and column.
   */
  center(row, column) {
    let rows = this._liveCells.map(cell => cell.row);
    let rowShift = row - Math.round((Math.min(...rows) + Math.max(...rows)) / 2);
    let columns = this._liveCells.map(cell => cell.column);
    let columnShift = column - Math.round((Math.min(...columns) + Math.max(...columns)) / 2);

    return new Pattern(
      this._liveCells.map(
        cell => new Cell(cell.row + rowShift, cell.column + columnShift, cell.alive)
      )
    );
  }

  /**
   * Returns a copy of this pattern rotated about the given pivot cell.
   *
   * @param {Rotation} direction - The direction of rotation.
   * @param {number} pivotRow - The row of the pivot cell.
   * @param {number} pivotColumn - The column of the pivot cell.
   * @return {Pattern} A copy of this pattern rotated about the given pivot cell.
   */
  rotate(direction, pivotRow, pivotColumn) {
    let sign = direction == Rotation.CLOCKWISE ? 1 : -1;
    return new Pattern(
      this._liveCells.map(
        cell => new Cell(
          pivotRow + sign * (cell.column - pivotColumn),
          pivotColumn - sign * (cell.row - pivotRow),
          cell.alive
        )
      )
    );
  }

  /**
   * Returns an iterator for this pattern's live cells.
   *
   * @return {Iterator<Cell>} An iterator for the pattern's live cells.
   */
  [Symbol.iterator]() {
    return this._liveCells.values();
  }

  /**
   * Creates a pattern from the given run-length encoded string.
   *
   * @param {string} rle - The run-length encoded pattern string.
   * @return {Pattern} The pattern corresponding to the given string.
   * @see http://conwaylife.com/wiki/Run_Length_Encoded
   */
  static fromRle(rle) {
    // Tokenize the pattern.
    let lines = rle.split(/\r?\n/);
    let tokens = dropWhile(lines, line => line.startsWith("#") || line.startsWith("x = "))
      .join("")
      .split(/([bo$!])/)
      .filter(token => token != "");

    // Ignore everything after the !.
    if (tokens.indexOf("!") != -1) {
      tokens = tokens.slice(0, tokens.indexOf("!"));
    } else {
      throw new Error("Missing end-of-pattern tag \"!\"");
    }

    // Replace run counts with the equivalent number of duplicated tags.
    let tags = tokens.map((token, index) => {
      if (/[0-9]+/.test(token)) {
        return tokens[index + 1].repeat(Number.parseInt(token) - 1);
      } else {
        return token;
      }
    }).join("");

    // Evaluate the tags and create the pattern.
    let liveCells = [];
    let row = 0;
    let column = 0;
    for (let tag of tags) {
      switch (tag) {
        case "b":
          column++;
          break;
        case "o":
          liveCells.push(new Cell(row, column++, true));
          break;
        case "$":
          row++;
          column = 0;
          break;
        default:
          throw new Error("Invalid tag \"" + tag + "\"");
      }
    }

    return new Pattern(liveCells);
  }
}

/**
 * Additional properties for a pattern.
 *
 * @typedef {Object} PatternProperties
 * @property {string} name - The name of the pattern.
 * @property {string} author - The author of the pattern.
 * @property {string} description - A description of the pattern.
 * @property {string} rle - The run-length encoded pattern string, excluding metadata.
 * @see http://conwaylife.com/wiki/Run_Length_Encoded
 */

/**
 * Parses a run-length encoded pattern string and returns the pattern's properties.
 *
 * @param {string} rle - The run-length encoded pattern string.
 * @return {PatternProperties} The pattern's properties.
 * @see http://conwaylife.com/wiki/Run_Length_Encoded
 */
export function parseRleProperties(rle) {
  // Convert the property lines into [letter, value] pairs.
  let lines = rle.split(/\r?\n/);
  let preamble = takeWhile(lines, line => line.startsWith("#"))
    .map(line => [line[1], line.substring(2).trim()]);

  // Add the [letter, value] pairs to an object.
  let properties = {};
  for (let [letter, value] of preamble) {
    if (properties.hasOwnProperty(letter)) {
      properties[letter] += " " + value;
    } else {
      properties[letter] = value;
    }
  }

  // The remainder of the RLE string is the pattern itself.
  let pattern = lines.slice(preamble.length + 1).join("");

  return {
    name: properties["N"],
    author: properties["O"],
    description: properties["C"],
    rle: pattern
  };
}
