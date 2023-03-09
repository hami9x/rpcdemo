# RPC Auction Demo

This is a full-stack demo application written in Typescript and uses JSON-RPC for seamless communication between frontend and backend.

Online Demo: https://auctiondemo.netlify.app

Subpackages and dependencies:
- apps/cli (Yargs)
- apps/web (React, MantineUI)
- packages/core
- packages/server (Koa, MongoDB)

## Building and running
### Environment setup
Create `.env` file with MongoDB connection, for example:
````
DB_MONGO_HOST=yourmongo.mongodb.net
DB_MONGO_USER=yourmongouser
DB_MONGO_PASSWORD=yourmongopassword
DB_MONGO_DATABASE=yourmongodemo
DB_MONGO_QUERY_PARAMS=retryWrites=true&w=majority&compressors=zstd
````

### Install dependencies
`yarn`

### Build (required)
`yarn build`

### Run the API server
`yarn apiserver`

### Run the web app
`yarn web:serve`

## Development
* Use `yarn watch` to watch and compile the code.
* Use `yarn apiserver:dev` to run the server.
* Use `yarn web:dev` to run the web app.
* Use `yarn test` to run the tests.
