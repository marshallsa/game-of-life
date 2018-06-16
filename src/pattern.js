import Cell from "./cell.js";

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
     * Returns a copy of this pattern centered at the given row and column.
     *
     * @param {number} row - The new row the pattern is centered on.
     * @param {number} column - The new column the pattern is centered on.
     * @return {Pattern} A copy of this pattern centered at the given row and
     *     column.
     */
    center(row, column) {
        // Calculate the difference between the current center and the new
        // center.
        let rows = this._liveCells.map(cell => cell.row);
        let columns = this._liveCells.map(cell => cell.column);
        let rowDiff = row - Math.round((Math.min(...rows) + Math.max(...rows)) / 2);
        let columnDiff = column - Math.round((Math.min(...columns) + Math.max(...columns)) / 2);

        // Shift all the cells to match the new center.
        let newCells = [];
        for (let cell of this._liveCells) {
            newCells.push(new Cell(cell.row + rowDiff, cell.column + columnDiff, cell.alive));
        }
        return new Pattern(this.name, newCells);
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
     * [LifeWiki](http://conwaylife.com/wiki/Plaintext) for more information
     * about the plaintext format.
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
                    throw new Error(
                        "Invalid character \"" + character + "\" at row " + (row + 1) + ", column " + (column + 1));
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
