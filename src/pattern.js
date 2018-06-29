import Cell from "./cell.js";

import dropWhile from "lodash-es/dropWhile";
import last from "lodash-es/last";
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
    if (this._liveCells.length === 0) {
      return 0;
    }
    const columns = this._liveCells.map(cell => cell.column);
    return Math.max(...columns) - Math.min(...columns) + 1;
  }

  /**
   * The height of this pattern. The height is the number of cells spanned
   * from the topmost live cell to the bottommost live cell.
   *
   * @type {number}
   */
  get height() {
    if (this._liveCells.length === 0) {
      return 0;
    }
    const rows = this._liveCells.map(cell => cell.row);
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
    const rows = this._liveCells.map(cell => cell.row);
    const rowShift = row - Math.round((Math.min(...rows) + Math.max(...rows)) / 2);
    const columns = this._liveCells.map(cell => cell.column);
    const columnShift = column - Math.round((Math.min(...columns) + Math.max(...columns)) / 2);

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
    const sign = direction === Rotation.CLOCKWISE ? 1 : -1;
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
   * Creates a pattern from the given preset.
   *
   * @param {PatternPreset} preset - The pattern preset.
   * @return {Pattern} The pattern corresponding to the given preset.
   */
  static fromPreset(preset) {
    // Parse the preset's RLE string.
    const lines = preset.pattern.split(/\r?\n/);
    let tokens = dropWhile(lines, line => line.startsWith("#") || line.startsWith("x = "))
      .join("")
      .split(/([bo$!])/)
      .filter(token => token !== "");

    // Ignore everything after the !.
    if (tokens.indexOf("!") !== -1) {
      tokens = tokens.slice(0, tokens.indexOf("!"));
    } else {
      throw new Error("Missing end-of-pattern tag \"!\"");
    }

    // Replace run counts with the equivalent number of duplicated tags.
    const tags = tokens.map((token, index) => {
      if (/[0-9]+/.test(token)) {
        return tokens[index + 1].repeat(Number.parseInt(token) - 1);
      } else {
        return token;
      }
    }).join("");

    // Evaluate the tags and create the pattern.
    const liveCells = [];
    let row = 0;
    let column = 0;
    for (const tag of tags) {
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
 * A pattern preset has a pattern's serialized string as well as metadata for the pattern.
 *
 * @typedef {Object} PatternPreset
 * @property {string} name - The name of the pattern.
 * @property {string} author - The author of the pattern.
 * @property {string} description - A description of the pattern.
 * @property {string} url - The URL to the pattern's web page.
 * @property {string} rule - The rulestring for the pattern in B/S notation.
 * @property {string} pattern - The run-length encoded pattern string, excluding metadata.
 * @see http://conwaylife.com/wiki/Run_Length_Encoded
 */

/**
 * Reads a run-length encoded pattern string and returns the preset for the pattern.
 *
 * @param {string} rle - The run-length encoded pattern string.
 * @return {PatternPreset} The preset for the pattern.
 * @see http://conwaylife.com/wiki/Run_Length_Encoded
 */
export function readRlePattern(rle) {
  const lines = rle.split(/\r?\n/);

  // Read the # lines.
  const hashLines = takeWhile(lines, line => line.startsWith("#"));
  const hash = readRleHash(hashLines);

  // Read the header line.
  const headers = readRleHeader(lines[hashLines.length]);

  // The rest of the RLE string is the pattern itself.
  const pattern = lines.slice(hashLines.length + 1).join("");

  // The last comment line may have a URL to the pattern's web page.
  let url = "";
  if (hash.has("C")) {
    const commentLines = hash.get("C").split("\n");
    if (last(commentLines).startsWith("http:") || last(commentLines).startsWith("https:")) {
      url = commentLines.pop();
    } else if (last(commentLines).startsWith("www.")) {
      url = "http://" + commentLines.pop();
    }
    hash.set("C", commentLines.join("\n"));
  }

  return {
    name: hash.get("N") || "",
    author: hash.get("O") || "",
    description: hash.get("C") || "",
    url: url,
    rule: headers.get("rule"),
    pattern: pattern
  };
}

/**
 * Reads the hash lines in a run-length encoded pattern string and returns a map of letter keys to
 * values. If a letter appears on multiple lines, each line will be separated by \n in the value.
 *
 * @param {string[]} lines - The hash lines in a run-length encoded pattern string.
 * @return {Map<string, string>} A map of letter keys to values.
 */
function readRleHash(lines) {
  // Convert the lines into [letter, value] pairs.
  lines = lines.map(line => [line[1], line.substring(2).trim()]);

  // Fill a map with the [letter, value] pairs, combining values that have the same letter.
  const hash = new Map();
  for (const [letter, value] of lines) {
    if (hash.has(letter)) {
      hash.set(letter, hash.get(letter) + "\n" + value);
    } else {
      hash.set(letter, value);
    }
  }
  return hash;
}

/**
 * Reads the header line in a run-length encoded pattern string and returns a map of each key-value
 * pair.
 *
 * @param {string} line - The header line in a run-length encoded pattern string.
 * @return {Map<string, string>} A map of each key-value pair.
 */
function readRleHeader(line) {
  // Convert the key-value pairs in the header into a map.
  const headers = new Map(
    line
      .split(",")
      .map(header =>
        header
          .split("=")
          .map(s => s.trim())
      )
  );

  if (headers.has("x")) {
    headers.set("x", Number.parseInt(headers.get("x")));
  }
  if (headers.has("y")) {
    headers.set("y", Number.parseInt(headers.get("y")));
  }

  if (headers.has("rule")) {
    const sbRule = headers.get("rule").match(/^[Ss]?([0-8]+)\/[Bb]?([0-8]+)$/);
    if (sbRule !== null) {
      // Convert S/B notation into B/S notation.
      headers.set("rule", "B" + sbRule[2] + "/S" + sbRule[1]);
    } else {
      // All rulestrings should be capitalized.
      headers.set("rule", headers.get("rule").toUpperCase());
    }
  } else {
    // Use Game of Life rules by default.
    headers.set("rule", "B3/S23");
  }

  return headers;
}
