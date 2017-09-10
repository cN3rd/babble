# Babble
Babble is a basic chat client+server, implement using long-polling and Node.js

## Getting started
First, install the chat by cloning this git repo and run `npm install`.

To run the web app, simply run `npm start`

To run the tests, simply run `npm test`

The server runs at localhost:9000, and the webapp runs at localhost:8080.

## NPM Scripts
* `npm start` - runs both the client and the server normally.
* `npm test` - runs the server tests using mocha & opens the folder in port 8081
* `npm run client` - Runs the client server using `http-server`
* `npm run server` - Runs the server using vanilla Node.js
* `npm run server-dev` - Runs the server script using `nodemon`
* `sass-compile` - Compiles the SCSS code in `/client/style`.
* `sass-watch` - Watches the SCSS code in `/client/style` and recompiles it each time it is changed.