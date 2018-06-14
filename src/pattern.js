import Cell from "./cell.js";

/**
 * A pattern is a collection of cells.
 */
export default class Pattern {
    /**
     * Creates a new pattern from the given cells.
     *
     * @param {Cell[]} cells - The cells that make up the pattern.
     */
    constructor(cells) {
        this._liveCells = cells.filter(cell => cell.alive);
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
        return new Pattern(newCells);
    }

    /**
     * Returns an iterator for the pattern's live cells.
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
     */
    static fromPlaintext(plaintext) {
        let liveCells = [];
        let row = 0;
        for (let line of plaintext.split("\n")) {
            if (line[0] == "!") {
                continue;
            }

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
        return new Pattern(liveCells);
    }
}

/**
 * @typedef NamedPattern
 * @type {object}
 * @property {string} name - The name of the pattern.
 * @property {Pattern} pattern - The pattern.
 */

/**
 * A list of common Game of Life patterns.
 *
 * @type {NamedPattern[]}
 */
export const PATTERNS = [
    {
        name: "Blinker",
        pattern: Pattern.fromPlaintext(
            "OOO")
    },
    {
        name: "Toad",
        pattern: Pattern.fromPlaintext(
            ".OOO\n" +
            "OOO.")
    },
    {
        name: "Beacon",
        pattern: Pattern.fromPlaintext(
            "OO..\n" +
            "OO..\n" +
            "..OO\n" +
            "..OO")
    },
    {
        name: "Pulsar",
        pattern: Pattern.fromPlaintext(
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
            "..OO.....OO..")
    },
    {
        name: "Pentadecathlon",
        pattern: Pattern.fromPlaintext(
            "..O....O..\n" +
            "OO.OOOO.OO\n" +
            "..O....O..")
    },
    {
        name: "Glider",
        pattern: Pattern.fromPlaintext(
            ".O.\n" +
            "..O\n" +
            "OOO")
    },
    {
        name: "Lightweight Spaceship",
        pattern: Pattern.fromPlaintext(
            "O..O.\n" +
            "....O\n" +
            "O...O\n" +
            ".OOOO")
    },
    {
        name: "Block",
        pattern: Pattern.fromPlaintext(
            "OO\n" +
            "OO")
    },
    {
        name: "Beehive",
        pattern: Pattern.fromPlaintext(
            ".OO.\n" +
            "O..O\n" +
            ".OO.\n")
    },
    {
        name: "Loaf",
        pattern: Pattern.fromPlaintext(
            ".OO.\n" +
            "O..O\n" +
            ".O.O\n" +
            "..O.")
    },
    {
        name: "Boat",
        pattern: Pattern.fromPlaintext(
            "OO.\n" +
            "O.O\n" +
            ".O.")
    },
    {
        name: "Tub",
        pattern: Pattern.fromPlaintext(
            ".O.\n" +
            "O.O\n" +
            ".O.")
    }
];
