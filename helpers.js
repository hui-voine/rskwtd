import { getDigitalOceanServers } from "./helpers/get-do-servers.js";
import SERVERS from "./servers.js";
import { NodeSSH } from "node-ssh";
import fetch from "node-fetch";

import CONSTANTS from "./constants.js";

export const getDropletNetworkV4IpAdress = (data) => {
  return data.droplet.networks.v4.find((n) => {
    return n.type === "public";
  }).ip_address;
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const printTerminalSTD = (data) => {
  if (data.stdout) console.log(data.stdout);
  if (data.stderr) console.log(data.stderr);
};

export const getServersDigitalOcean = (doResponse) => {
  return doResponse.droplets
    .map((data) => {
      const network = data.networks.v4.find((n) => {
        return n.type === "public";
      });

      if (!network || !network.ip_address) return null;
      return {
        connection: {
          host: network.ip_address,
          username: "root",
          privateKey: `${process.env.HOME}/.ssh/id_rsa`,
        },
      };
    })
    .filter((config) => config !== null);
};

export const getServers = async () => {
  let serversDigitalOcean = [];
  try {
    const doResponse = await getDigitalOceanServers();
    serversDigitalOcean = getServersDigitalOcean(doResponse);
  } catch (e) {
    serversDigitalOcean = [];
  }

  const servers = [...SERVERS, ...serversDigitalOcean];

  return servers;
};

export const applyCommandsToServer = (server) => (cmds) => {
  const ssh = new NodeSSH();
  const query = cmds.reduce((q, command) => {
    const msg = `\n[${server.connection.ip}]\n[${cmds.indexOf(command) + 1}/${
      cmds.length
    }] ${command}`;

    return q
      .then(() => console.log(msg))
      .then(() => ssh.execCommand(command))
      .then(printTerminalSTD);
  }, ssh.connect(server.connection));

  return query;
};

export const cleanUpAllServers = async () => {
  const doResponse = await getDigitalOceanServers();

  doResponse.droplets.map((droplet) => {
    const id = droplet.id;
    console.log("Gonna die... " + droplet.id);

    fetch(`${CONSTANTS.DO_API_ROOT}/droplets/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONSTANTS.DO_API_KEY}`,
      },
    });
  });
};

export const stopAllBackgroundProcesses = async () => {
  const servers = await getServers();

  const reqs = servers.map((server) => {
    const ssh = new NodeSSH();
    return (
      ssh
        .connect(server.connection)
        // Kills all current docker
        .then(() => ssh.execCommand("sudo docker kill $(sudo docker ps -q)"))
        .then(() => ssh.execCommand("sudo pkill python"))
        .catch((e) => {
          console.log("ERROR: " + server.connection.host);
          console.log(e);
        })
        .finally(() => {
          console.log("Cleaned up: " + server.connection.host);
        })
    );
  });

  Promise.all(reqs).finally(() => {
    process.exit(0);
  });
};
