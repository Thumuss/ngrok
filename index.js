/// <reference path="./index.d.ts"/>

const { NgrokClient, NgrokClientError } = require("./src/client");
const { getProcess, killProcess } = require("./src/process");
const { getVersion } = require("./src/version");
const { setAuthtoken } = require("./src/authtoken");

const {
  defaults,
  validate,
  defaultConfigPath,
  oldDefaultConfigPath,
} = require("./src/utils");

/**
 * @type string | null
 */
let processUrl = null;
/**
 * @type NgrokClient | null
 */
let ngrokClient = null;

/**
 *
 * @param {Object | string} opts
 * @returns Promise<string>
 */

let authtoken;

async function connect(opts) {
  const { globalOpts } = defaults(opts);
  validate(globalOpts);

  if (globalOpts.authtoken) {
    if (authtoken !== globalOpts.authtoken) {
      await kill();
    }
    authtoken = globalOpts.authtoken;
  }
  processUrl = await getProcess(globalOpts);
  ngrokClient = new NgrokClient(processUrl);
  return;
}


/**
 *
 * @param {string?} publicUrl
 * @returns Promise<void>
 */
async function disconnect(publicUrl = null) {
  if (!ngrokClient) return;
  const tunnels = (await ngrokClient.listTunnels()).tunnels;
  if (!publicUrl) {
    const disconnectAll = tunnels.map((tunnel) =>
      disconnect(tunnel.public_url)
    );
    return Promise.all(disconnectAll);
  }
  const tunnelDetails = tunnels.find(
    (tunnel) => tunnel.public_url === publicUrl
  );
  if (!tunnelDetails) {
    throw new Error(`there is no tunnel with url: ${publicUrl}`);
  }
  return ngrokClient.stopTunnel(tunnelDetails.name);
}

/**
 *
 * @returns Promise<void>
 */
async function kill() {
  if (!ngrokClient) return;
  await killProcess();
  ngrokClient = null;
}

/**
 *
 * @returns string | null
 */
function getUrl() {
  return processUrl;
}

/**
 *
 * @returns NgrokClient | null
 */
function getApi() {
  return ngrokClient;
}

module.exports = {
  connect,
  disconnect,
  authtoken: setAuthtoken,
  defaultConfigPath,
  oldDefaultConfigPath,
  kill,
  getUrl,
  getApi,
  getVersion,
  NgrokClient,
  NgrokClientError,
};
