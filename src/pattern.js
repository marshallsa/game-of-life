import Cell from "./cell.js";

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
   * @param {string} name - The name of the pattern.
   * @param {Cell[]} cells - The cells that make up the pattern.
   */
  constructor(name, cells) {
    this._name = name;
    this._liveCells = cells.filter(cell => cell.alive);
  }

  /**
   * The name of this pattern.
   *
   * @type {string}
   */
  get name() {
    return this._name;
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
      this.name,
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
      this.name,
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
   * Creates a pattern from the given plaintext-formatted string. See
   * [LifeWiki](http://conwaylife.com/wiki/Plaintext) for more information about the plaintext
   * format.
   *
   * @param {string} plaintext - The plaintext pattern string.
   * @return {Pattern} A pattern created from the given string.
   * @throws {Error} If the string could not be parsed.
   */
  static fromPlaintext(plaintext) {
    // Extract the pattern name.
    let lines = plaintext.split("\n");
    if (lines.length == 0 || !lines[0].startsWith("!Name:")) {
      throw new Error("Expected \"!Name:\" header");
    }
    let name = lines[0].substring("!Name:".length).trim();

    // Skip the comment lines.
    let index = 0;
    while (index < lines.length && lines[index][0] == "!") {
      index++;
    }

    // Extract the pattern cells.
    let liveCells = [];
    let row = 0;
    for (let line of lines.slice(index)) {
      let column = 0;
      for (let character of line) {
        if (character == "O") {
          liveCells.push(new Cell(row, column, true));
        } else if (character != ".") {
          throw new Error("Invalid character: " + character);
        }
        column++;
      }
      row++;
    }
    return new Pattern(name, liveCells);
  }
}

/**
 * A list of common Game of Life patterns.
 *
 * @type {Pattern[]}
 */
export const PATTERNS = [
  "!Name: Blinker\n" +
  "OOO",

  "!Name: Toad\n" +
  ".OOO\n" +
  "OOO.",

  "!Name: Beacon\n" +
  "OO..\n" +
  "OO..\n" +
  "..OO\n" +
  "..OO",

  "!Name: Pulsar\n" +
  "..OO.....OO..\n" +
  "...OO...OO...\n" +
  "O..O.O.O.O..O\n" +
  "OOO.OO.OO.OOO\n" +
  ".O.O.O.O.O.O.\n" +
  "..OOO...OOO..\n" +
  ".............\n" +
  "..OOO...OOO..\n" +
  ".O.O.O.O.O.O.\n" +
  "OOO.OO.OO.OOO\n" +
  "O..O.O.O.O..O\n" +
  "...OO...OO...\n" +
  "..OO.....OO..",

  "!Name: Pentadecathlon\n" +
  "..O....O..\n" +
  "OO.OOOO.OO\n" +
  "..O....O..",

  "!Name: Glider\n" +
  ".O.\n" +
  "..O\n" +
  "OOO",

  "!Name: Lightweight Spaceship\n" +
  "O..O.\n" +
  "....O\n" +
  "O...O\n" +
  ".OOOO",

  "!Name: Block\n" +
  "OO\n" +
  "OO",

  "!Name: Beehive\n" +
  ".OO.\n" +
  "O..O\n" +
  ".OO.\n",

  "!Name: Loaf\n" +
  ".OO.\n" +
  "O..O\n" +
  ".O.O\n" +
  "..O.",

  "!Name: Boat\n" +
  "OO.\n" +
  "O.O\n" +
  ".O.",

  "!Name: Tub\n" +
  ".O.\n" +
  "O.O\n" +
  ".O."
].map(plaintext => Pattern.fromPlaintext(plaintext));
