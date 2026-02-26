# Advanced Stock Price Checker

## Prerequisites
- Node.JS 24+
- Docker
- Yarn v1.22+

## Docker configuration steps
Create .env file based on .env.example. Replace the `FINNHUB_API_KEY` with your own.

Run docker:
```sh
docker compose up --build
```

This will setup the necessary database and start the application on port 3000.<br>
*Note*: it's expected to have an error on the first run as the database is not yet setup.

Run the database setup:
```sh
docker exec -it aspc npx prisma migrate deploy
```

This will run the necessary modifications and the application is ready to go.

Open http://localhost:3000/api-doc in your browser to access the OAS

## Installation steps for Development
To install dependencies run the following command:
```sh
yarn install
```
Create .env file based on .env.example. Replace the `FINNHUB_API_KEY` with your own

To initialize database structure run these commands:
```sh
yarn run prisma migrate
yarn run prisma generate
```

## Start application
```sh
yarn start
```

Open http://localhost:3000/api-doc in your browser to access the OAS

## Usage
### Adding a new symbol to check-out
Endpoint: PUT /stock/:symbol
Required parameter ID of the symbol to be accessed via FinnHub API - the symbol is case sensitive!

### Retrieve symbol information with moving average
Endpoint GET /stock/:symbol
Required parameter: ID of the symbol previously added for check-out. The value is case sensitive!

### Automatic refresh
The refresh will run for all recorded symbol in every minute. The configuration can be changed only within the code in `stock.service.ts` at `updateQuoteList` method (see @Cron definition)