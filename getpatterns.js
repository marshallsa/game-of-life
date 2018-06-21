const fs = require("fs");
const http = require("http");
const StreamZip = require("node-stream-zip");

import sortedUniqBy from "lodash-es/sortedUniqBy";

import Pattern, {readRlePattern} from "./src/pattern.js";

/**
 * The hostname of the server where the ZIP file should be downloaded from.
 *
 * @type {string}
 */
const UPDATE_HOSTNAME = "www.conwaylife.com";

/**
 * The path to the ZIP file on the server.
 *
 * @type {string}
 */
const UPDATE_PATH = "/patterns/all.zip";

/**
 * The path where the downloaded ZIP file should be saved.
 *
 * @type {string}
 */
const ZIP_FILE = "patterns.zip";

/**
 * The name of the JSON file to output patterns to.
 *
 * @type {string}
 */
const JSON_FILE = "patterns.json";

/**
 * A list of common patterns that should appear first in the output.
 *
 * @type {string[]}
 */
const COMMON_PATTERNS = Object.freeze([
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
 * Downloads a file from a remote server if a newer version is available.
 *
 * @param {[type]} filename - The name of the local file.
 * @param {[type]} hostname - The remote server's hostname.
 * @param {[type]} path - The path to the file on the remote server.
 * @param {function()} callback - Called when the update finishes, even if the file was not
 * downloaded.
 */
function updateFile(filename, hostname, path, callback) {
  let time;
  try {
    time = fs.statSync(filename).mtime.toGMTString();
  } catch (e) {
    time = null;
  }

  const headers = {};
  if (time != null) {
    headers["If-Modified-Since"] = time;
  }
  const request = http.get({hostname, path, headers});

  request.on("response", response => {
    if (response.statusCode == 200) {
      // Download the new version.
      console.log("Updating " + filename + "...");

      const file = fs.createWriteStream(filename);
      response.pipe(file);
      file.on("finish", () => {
        console.log(filename + " has been updated");
        file.close(callback);
      });
    } else if (response.statusCode == 304) {
      // We don't need to do anything.
      console.log(filename + " is up-to-date");
      callback();
    } else {
      console.error(
        "Error updating " + filename + ": Server responded with " + response.statusCode + " " +
        response.statusMessage
      );
      callback();
    }
  });

  request.on("error", error => {
    console.error("Error updating " + filename + ": " + error.message);
    callback();
  });
}

/**
 * Returns the list of pattern presets in the given ZIP file.
 *
 * @param {StreamZip} zip - The ZIP file.
 * @return {PatternPreset[]} The list of pattern presets in the given ZIP file.
 */
function getPatternPresets(zip) {
  return (
    Object.values(zip.entries())
      .filter(entry => entry.name.endsWith(".rle"))
      .map(entry => readRlePattern(zip.entryDataSync(entry).toString()))
  );
}

updateFile(ZIP_FILE, UPDATE_HOSTNAME, UPDATE_PATH, () => {
  const zip = new StreamZip({file: ZIP_FILE, storeEntries: true});

  zip.on("ready", () => {
    // Get the patterns from the ZIP file and filter out patterns with no name, patterns bigger than
    // 50x50 cells, and agars (patterns designed to be repeated infinitely).
    let patterns = getPatternPresets(zip).filter(preset => {
      try {
        const pattern = Pattern.fromPreset(preset);
        return (
          preset.name != ""
          && !/agar/i.test(preset.description)
          && pattern.width <= 50
          && pattern.height <= 50
        );
      } catch (e) {
        console.error((preset.name || "(no name)") + ": " + e.message);
        return false;
      }
    });

    // Sort the patterns alphabetically by name. Also, put the patterns in COMMON_PATTERNS at the
    // beginning and pattern names that start with a number or symbol at the end.
    patterns.sort((a, b) => {
      if (COMMON_PATTERNS.includes(a.name) != COMMON_PATTERNS.includes(b.name)) {
        return COMMON_PATTERNS.includes(a.name) ? -1 : 1;
      } else if (/^[A-Za-z]/.test(a.name) != /^[A-Za-z]/.test(b.name)) {
        return /^[A-Za-z]/.test(a.name) ? -1 : 1;
      } else if (a.name != b.name) {
        return a.name < b.name ? -1 : 1;
      } else {
        return 0;
      }
    });

    // Remove duplicate pattern names.
    patterns = sortedUniqBy(patterns, "name");

    fs.writeFileSync(JSON_FILE, JSON.stringify(patterns, null, 2));
    console.log("Wrote " + patterns.length + " patterns to " + JSON_FILE);
  });
});
