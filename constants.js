export default {
  DO_API_KEY: process.env.DO_API_KEY,
  DO_API_SSH_KEY_ID: process.env.DO_API_SSH_KEY_ID,
  DO_API_ROOT: "https://api.digitalocean.com/v2",

  DEFAULT_SSH_KEY_PATH: null, // TODO

  /* 
    Type of server that will be created    
    All values: https://slugs.do-api.dev
  */
  // CPU: "s-2vcpu-4gb",
  CPU: "s-1vcpu-1gb",

  /* 
    Server region
    https://docs.digitalocean.com/products/platform/availability-matrix/

    npm run create -- -c 3 uses the first 3 region values from this list.
  */
  REGIONS: [
    "nyc1",
    "lon1",
    "fra1",
    "nyc3",
    "ams3",
    "sfo3",
    "sgp1",
    "fra1",

    "blr1",
    // disabled on Digital Ocean. Avoid using.
    // "tor1",
    // "ams2",
    // "nyc2",
    // "sfo1",
    // "sfo2",
  ],
};
