# Cart Service

A shopping cart management service for the Aether Motors application. Currently uses an in-memory store and will be backed by Redis in production.

## Getting Started

### Installation

```bash
npm install
```

### Running the Service

```bash
# Development
npm run dev

# Production
npm start
```

The service runs on port 3002 by default. Set the `PORT` environment variable to use a different port.

## API Endpoints

- **GET /health** - Health check endpoint
- **GET /cart/:userId** - Retrieve cart for a specific user
- **POST /cart/:userId/items** - Add an item to user's cart
- **DELETE /cart/:userId** - Clear a user's cart

## Docker

Build and run with Docker:

```bash
docker build -t cart-service .
docker run -p 3002:3002 cart-service
```

## Architecture

Currently uses an in-memory store for cart data. Future versions will integrate with Redis for persistent, distributed caching.
