import "dotenv/config";
import { NodeSSH } from "node-ssh";
import { getServers, stopAllBackgroundProcesses } from "../helpers.js";

stopAllBackgroundProcesses();
