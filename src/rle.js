import Cell from "./cell.js";

import dropWhile from "lodash-es/dropWhile";
import last from "lodash-es/last";
import takeWhile from "lodash-es/takeWhile";

/**
 * Returns the pattern preset for the given run-length encoded pattern string.
 *
 * @param {string} rle - The run-length encoded pattern string.
 * @return {PatternPreset} The pattern preset for the pattern string.
 * @see http://conwaylife.com/wiki/Run_Length_Encoded
 */
export function presetFromRle(rle) {
  const lines = rle.split(/\r?\n/);

  // Read the # lines.
  const hashLines = takeWhile(lines, line => line.startsWith("#"));
  const hash = parseHash(hashLines);

  // Read the header line.
  const headers = parseHeader(lines[hashLines.length]);

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
 * Returns the live cells in the given run-length encoded pattern string.
 *
 * @param {string} rle - The run-length encoded pattern string.
 * @return {Cell[]} The live cells in the given pattern string.
 */
export function cellsFromRle(rle) {
  const lines = rle.split(/\r?\n/);
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
  return liveCells;
}

/**
 * Parses the hash lines in a run-length encoded pattern string and returns a map of letter keys to
 * values. If a letter appears on multiple lines, each line will be separated by \n in the value.
 *
 * @param {string[]} lines - The hash lines in a run-length encoded pattern string.
 * @return {Map<string, string>} A map of letter keys to values.
 */
function parseHash(lines) {
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
 * Parses the header line in a run-length encoded pattern string and returns a map of each key-value
 * pair.
 *
 * @param {string} line - The header line in a run-length encoded pattern string.
 * @return {Map<string, string>} A map of each key-value pair.
 */
function parseHeader(line) {
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
