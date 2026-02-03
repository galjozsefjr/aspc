# Advanced Stock Price Checked

## Prerequisites
- Node.JS 24+
- Docker
- Yarn v1.22+

## Installation steps
To install dependencies run the following command:
```sh
yarn install
```
Create .env file based on .env.example. Replace the `FINNHUB_API_KEY` with your own

Run docker:
```sh
docker compose up
```

This will setup the necessary database
*Note:* as an alternative you can define the necessary environment variables as 

To initialize database structure run these commands:
```sh
yarn run prisma migrate
yarn run prisma generate
```

## Start application
```sh
yarn start
```

Open http://localhost:3000/api-doc in your browser to access the Swagger

## Usage
### Adding a new symbol to check-out
Endpoint: PUT /stock/:symbol
Required parameter ID of the symbol to be accessed via FinnHub API - the symbol is case sensitive!

### Retrieve symbol information with moving average
Endpoint GET /stock/:symbol
Required parameter: ID of the symbol previously added for check-out. The value is case sensitive!

### Automatic refresh
The refresh will run for all recorded symbol in every minute. The configuration can be changed only within the code in `stock.service.ts` at `updateQuoteList` method (see @Cron definition)