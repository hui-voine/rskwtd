import "dotenv/config";

// import COMMANDS from "../deps.json";
import { applyCommandsToServer, getServers } from "../helpers.js";

const printRes = (data) => {
  if (data.stdout) console.log(data.stdout);
  if (data.stderr) console.log(data.stderr);
};

const printStep = (i) => {
  console.log(`#00${i}`);
};

const cmds = [
  "sudo apt update",
  "sudo apt --assume-yes install python3-pip",
  "git clone https://github.com/MHProDev/MHDDoS.git",
  "pip install -r MHDDoS/requirements.txt",

  "sudo apt --assume-yes install apt-transport-https ca-certificates curl software-properties-common",
  "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -",
  'sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"',
  "sudo apt --assume-yes -qq update",
  "sudo apt --assume-yes install docker-ce",
  "sudo docker run -id --rm ddosify/ddosify",
];

const run = async () => {
  const servers = await getServers();
  console.log(`Update servers: ${servers.length}`);
  const requests = servers.map((server) => {
    const query = applyCommandsToServer(server)(cmds);

    return query.catch((e) => {
      console.log("Error: " + e);
    });
  });

  return Promise.all(requests)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => {
      console.log("Done");
      process.exit(0);
    });
};

run();
