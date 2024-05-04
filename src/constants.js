const { join, delimiter, dirname, resolve } = require("path");
const platform = require("os").platform();
const fs = require("fs");

const bin = platform === "win32" ? "ngrok.exe" : "ngrok";
const defaultDir = dirname(findExecutable(bin));
const ready = /starting web service.*addr=(\d+\.\d+\.\d+\.\d+:\d+)/;
const inUse = /address already in use/;

/**
 * @param {string} exe
 * @return {string|null}
 * */
function findExecutable(exe) {
  const envPath = process.env.PATH || "";
  const pathDirs = envPath
    .replace(/["]+/g, "")
    .replace("~", process.env.HOME)
    .split(delimiter)
    .filter(Boolean);
  const candidates = pathDirs
    .map((a) => fs.readdirSync(a).map((b) => resolve(a) + "/" + b))
    .flat();
  return candidates.find((a) => a.match(new RegExp(exe)));
}

module.exports = {
  defaultDir,
  bin,
  ready,
  inUse,
};
