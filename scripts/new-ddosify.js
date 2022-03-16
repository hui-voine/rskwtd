import "dotenv/config";
import fetch from "node-fetch";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import CONSTANTS from "../constants.js";

import {
  applyCommandsToServer,
  getDropletNetworkV4IpAdress,
  printTerminalSTD,
} from "../helpers.js";
import { sleep } from "../helpers.js";
import COMMANDS from "../deps.json";

const WAIT_SEC = 180;

const { DO_API_KEY, DO_API_ROOT, DO_API_SSH_KEY_ID } = CONSTANTS;

const getArgFromCLI = (param) => {
  const argv = yargs(hideBin(process.argv)).argv;
  return argv[param];
};

const count = Number(getArgFromCLI("c")) || 1;
console.log(`Creating servers: ${count}`);

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

  console.log(`New droplet is here. ID: ${dropletID}`);
  console.log(
    `Hold it! Waiting ${WAIT_SEC} sec for server to boot... Chill out...`
  );

  await sleep(1000 * WAIT_SEC);

  const response2 = await fetch(`${DO_API_ROOT}/droplets/${dropletID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DO_API_KEY}`,
    },
  });

  const dropletDetails = await response2.json();

  console.log("Droblet created...");
  console.log("Installing ddosify...");

  const ip = getDropletNetworkV4IpAdress(dropletDetails);

  const connection = {
    host: ip,
    username: "root",
    privateKey: `${process.env.HOME}/.ssh/id_rsa`,
  };

  const query = applyCommandsToServer({ connection })(COMMANDS);

  query.catch((error) => {
    console.log("Error");
    console.error(error);
    process.exit(1);
  });

  query.finally(() => {
    process.exit(0);
  });
};

[...new Array(count)].forEach((_value, index) => {
  run(index);
});
