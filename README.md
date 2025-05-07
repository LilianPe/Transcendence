# Transcendence
Transcendence is a fullstack project with a mandatory part that concist on creating a Pong game with a tournament system and basics instructions on security and structure.
The project have been realised with TypeScript.

## Launch the projet
First `make certs` will generate you the ssl certificates.
Then `make init` will chmod them to give access to it for ELK.
Then `make build` to build the app.
Finnaly `make start` to launch the app.

The website is available on localhost:3100.
If you want to remove the https warning, you can load certs/ca.crt in your browser.

Then we had to choise some modules:

## Backend's Framework
We used Fastify to build the backend server ans the web server.
The backend is available on localhost:4500 (to make request at the API).

## Css Framework
We used TailwindCSS to build the css.

## Database
We used SQLite for the database.

## Blockchain
We store the result of each Tournaments on the Fuji testnet of Avalanche Blockchain.

## Remote Player
We uploaded a simple version of the App on Render: https://transcendence-web.onrender.com (You must wait for the app to launch when you visite the Website).

## Livechat
We added a livechat who work with Fastify WebSocket.

## AI
It is possible to play against an AI in local.

## Cybersecurity : WAF
The website pass throught a Web Aplication Firewall that protect the website from SQL injection and XSS and Bruteforce Attacks.

## Devops: ELK (Elasticsearch, Logstash, Kibana)
Elasticsearch is available on localhost:9400 with the password sets in .env (make env).
And a Dashboard's configuration can be loaded to consult the server's logs. (Available in elk/kibana/dashboard/kibana_basic.ndjson)

## Expanded browsers compatibility
Compatible with Firefox and Chrome

## Server Side Pong
Replace Basic Pong with Server-Side Pong and Implementing an API.
The server side pong works with Fastify WebSocket and the api is available on localhost:4500 and you can make request on theses paths:
/game/state
/game/init
/game/controls

with for example:
curl -k -H "x-api-password:ID" https://localhost:4500/game/state
or
curl -k -X POST -H "x-api-password:ID" http://localhost:4500/game/init
or
curl -X POST http://localhost:4500/game/controls \
  -H "Content-Type: application/json" -H "x-api-password:ID" \
  -d '{"playerId": "22690797-8848-43e6-8a72-e9cd2748b52f", "direction": "up"}'

replacing ID by the password that is given to you in the console of the website (F12)

## Stop the project
`make stop` will stop the dockers.
Then if you want to reset everything, do:
`docker volume rm $(docker volume ls)` to remove the volumes.
`docker system prune -a --volumes` to remove the docker images.
`rm -rf backend/db.sqlite` to reset the database.
