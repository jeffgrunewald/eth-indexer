# ERC-20 Transfer Indexer

## Description

This is a simple composite Typescript application to consume transfer events emitted from an Ethereum ERC-20 contract and store them in a Postgres database, as well as serve data about the indexed events via a REST API. The application is intended to be self-contained and deployed as a single container and provide configurable knobs via environment variables to set values such as:

- The address of the ERC-20 contract to index
- The starting block number from which to start indexing
- The RPC URL to use for fetching the blockchain data
- The database connection string
- The hostname and port on which to run the API server

If a START_BLOCK_NUMBER is provided, the application will begin fetching historical transfer events from the blockchain and storing them in the database until it is caught up, at which point it will process events as they are emitted from the contract in real-time. Whenever it is started up, the app will look for the block number of the latest event it indexed in the database and begin fetching historical blocks from that point until it is caught up again to be resilient against restarts and outages.

The entire project can be run locally with Docker and Docker-Compose using the associated docker-compose.yml file. Default values have been provided to allow the project to be run with minimal configuration, only requiring the first-time user to export the environment variable INDEXER_RPC_URL to the desired RPC URL or replace it with a static value in the compose file (as these typically include proprietary API keys).

Some minimal unit testing has been provided, as well as a Postman collection for testing the API endpoints and a Swagger/OpenAPI UI is also served by the Next.js webserver, redirecting from the root URL for easy discovery.

## What You'll Need

- Node.js (v18+)
- Docker and Docker-Compose (optional, for local development)
- PostgreSQL (optional, see docker-compose.yml to kill two birds with one stone)

## Getting Started

First, build and run the development server locally:

```bash
npm run dev
```

Assuming the Docker components are installed, build and run the project along with a database:

```bash
docker-compose up # to see the logs for both containers and run them in the foreground
docker-compose up -d # to run the containers in the background
```

By default, the docker-compose.yml configuration will persist the database data in a volume, allowing the database to be started and stopped without losing data. It is important to note that running tests or starting the server will likely cause conflicts in the database state persisted to the volume unless the volume is removed between running the test suite or starting the server.

With _some_ instance of Postgres available to the service via the DATABASE_URL environment variable, run the test suite:

```bash
npm run test
```

To run only the database while locally running the application or when running the test suite, run:

```bash
docker-compose up postgres # optionally with -d to run in the background
```

In order to clean up the containerized resources to run between different modes of validating the application, nuke their docker resources from orbit:

```bash
docker-compose down
docker volume rm eth-indexer_db-data
```

## Once Up and Running

With the "production" stack of indexer and database running together, the easiest way to see it in action is to open the Swagger UI at [http://localhost:3000/api-docs](http://localhost:3000/api-docs). The query parameters for the `GET /api/events` endpoint are designed to be forgiving with reasonable defaults and the `GET /api/stats` endpoint will provide a summary of the latest data, including the timestamp of the latest indexed event which should indicate things are still rolling even if you're not following the logs. The provided Postman collection in the project root can also be used and there's always good old fashioned `curl` for the terminal purist.


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This is a [Next.js](https://nextjs.org) bootstrapped project.
