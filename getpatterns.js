const fs = require("fs");
const http = require("http");

const StreamZip = require("node-stream-zip");

import {parseRleProperties} from "./src/pattern.js";

/**
 * The name of the ZIP file to load patterns from.
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
 * The list of pattern filenames in the ZIP file to include in the output.
 *
 * @type {string[]}
 */
const PATTERN_NAMES = [
  "blinker.rle",
  "toad.rle",
  "beacon.rle",
  "pulsar.rle",
  "pentadecathlon.rle",
  "glider.rle",
  "lwss.rle",
  "block.rle",
  "beehive.rle",
  "loaf.rle",
  "boat.rle",
  "tub.rle"
];

/**
 * Downloads a file from a remote server if a newer version is available.
 *
 * @param {[type]} name - The name of the local file.
 * @param {[type]} remoteHost - The remote server's hostname.
 * @param {[type]} remotePath - The path to the file on the remote server.
 * @param {function()} callback - Called when the update finishes, even if the file was not
 * downloaded.
 */
function updateFile(name, fromHostname, fromPath, callback) {
  let time;
  try {
    time = fs.statSync(name).mtime.toGMTString();
  } catch (e) {
    time = null;
  }

  const request = http.get({
    hostname: fromHostname,
    path: fromPath,
    headers: time ? {
      "If-Modified-Since": time
    } : {}
  });

  request.on("response", response => {
    switch (response.statusCode) {
      case 200: {
        // Download the new version.
        console.log("Updating " + name + "...");
        const file = fs.createWriteStream(name);
        response.pipe(file);
        file.on("finish", () => {
          console.log(name + " has been updated.");
          file.close(callback);
        });
        break;
      }
      case 304:
        // We don't need to do anything.
        console.log(name + " is up-to-date.");
        callback();
        break;
      default:
        console.error(
          "Error updating " + name + ": Server responded with " + response.statusCode + " " +
          response.statusMessage
        );
        callback();
    }
  });

  request.on("error", error => {
    console.error("Error updating " + name + ": " + error.message);
    callback();
  });
}

updateFile(ZIP_FILE, "www.conwaylife.com", "/patterns/all.zip", () => {
  const zip = new StreamZip({file: ZIP_FILE, storeEntries: true});

  zip.on("ready", () => {
    const patterns = [];
    for (let name of PATTERN_NAMES) {
      const buffer = zip.entryDataSync(zip.entry(name));
      patterns.push(parseRleProperties(buffer.toString()));
    }

    fs.writeFileSync(JSON_FILE, JSON.stringify(patterns, null, 2));
    console.log("Wrote " + patterns.length + " patterns to " + JSON_FILE + ".");
  });

  zip.on("error", error => {
    console.error("Error reading " + ZIP_FILE + ": " + error.message);
    process.exit(1);
  });
});
