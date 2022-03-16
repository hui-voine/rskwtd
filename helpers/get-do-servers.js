import fetch from "node-fetch";
import CONSTANTS from "../constants.js";

export const getDigitalOceanServers = async () => {
  const response = await fetch(`${CONSTANTS.DO_API_ROOT}/droplets`, {
    method: "get",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONSTANTS.DO_API_KEY}`,
    },
  });

  return await response.json();
};
