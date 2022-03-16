import "dotenv/config";

import fetch from "node-fetch";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import CONSTANTS from "../constants.js";
import COMMANDS from "../deps.json";
import {
  applyCommandsToServer,
  cleanUpSingleDropletById,
  getDropletNetworkV4IpAdress,
  sleep,
} from "../helpers.js";

const { DO_API_KEY, DO_API_ROOT, DO_API_SSH_KEY_ID } = CONSTANTS;

const getArgFromCLI = (param) => {
  const argv = yargs(hideBin(process.argv)).argv;
  return argv[param];
};
const count = Number(getArgFromCLI("c")) || 1;

console.log(`Creating servers: ${count}`);

const requestUntilCreated = async (id) => {
  let on = true;
  let resGlobal;
  while (on) {
    const query = await fetch(`${DO_API_ROOT}/droplets/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DO_API_KEY}`,
      },
    });
    const res = await query.json();
    const ip = getDropletNetworkV4IpAdress(res);

    if (ip) {
      on = false;
      resGlobal = res;
    } else {
      await sleep(7);
    }
  }

  return resGlobal;
};

const run = async (index = 0) => {
  const region = CONSTANTS.REGIONS[index % CONSTANTS.REGIONS.length];
  console.log("Initializing new server...");
  console.log(`Region: ${region}`);

  const response = await fetch(`${DO_API_ROOT}/droplets`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONSTANTS.DO_API_KEY}`,
    },
    body: JSON.stringify({
      name: "russian-ship-knows-what-to-do",
      region,
      size: CONSTANTS.CPU,
      image: "ubuntu-20-04-x64",
      ssh_keys: [DO_API_SSH_KEY_ID],
      backups: false,
      ipv6: true,
      user_data: null,
      private_networking: null,
    }),
  });

  const data = await response.json();

  if (data.message) throw new Error(data.message);

  const dropletID = data.droplet.id;

  console.log(`✅ Droplet created, ID = ${dropletID}`);

  const dropletDetails = await requestUntilCreated(dropletID);

  console.log("ℹ️ Waiting for droplet to be initialized on DigitalOcean...");

  const ip = getDropletNetworkV4IpAdress(dropletDetails);
  await sleep(5);
  const connection = {
    host: ip,
    username: "root",
    privateKey: `${process.env.HOME}/.ssh/id_rsa`,
    // TODO
    readyTimeout: 1000 * 90 * 1000,
  };

  try {
    console.log("ℹ️ Installing dependencies...");
    return await applyCommandsToServer({ connection })(COMMANDS);
  } catch (e) {
    console.log("❌ Failed to init a droplet. Removing.");
    console.log("Error: " + e.message);
    return await cleanUpSingleDropletById(dropletID);
  }
};

const p = [...new Array(count)].map((_value, index) => {
  return run(index);
});

Promise.all(p).finally(() => {
  process.exit(0);
});
