const { join, delimiter, dirname } = require("path");
const platform = require("os").platform();
const fs = require("fs/promises");

const bin = platform === "win32" ? "ngrok.exe" : "ngrok";
const defaultDir = dirname(findExecutable(bin));
const ready = /starting web service.*addr=(\d+\.\d+\.\d+\.\d+:\d+)/;
const inUse = /address already in use/;

/**
 * From https://abdus.dev/posts/checking-executable-exists-in-path-using-node/
 * @param {string} exe executable name (without extension if on Windows)
 * @return {Promise<string|null>} executable path if found
 * */
async function findExecutable(exe) {
  const envPath = process.env.PATH || "";
  const envExt = process.env.PATHEXT || "";
  const pathDirs = envPath
    .replace(/["]+/g, "")
    .split(delimiter)
    .filter(Boolean);
  const extensions = envExt.split(";");
  const candidates = pathDirs.flatMap((d) =>
    extensions.map((ext) => path.join(d, exe + ext))
  );
  try {
    return await Promise.any(candidates.map(checkFileExists));
  } catch (e) {
    return null;
  }

  async function checkFileExists(filePath) {
    if ((await fs.stat(filePath)).isFile()) {
      return filePath;
    }
    throw new Error("Not a file");
  }
}

module.exports = {
  defaultDir,
  bin,
  ready,
  inUse,
};
