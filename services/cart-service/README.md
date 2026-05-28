# Cart Service

The shopping cart microservice for the Aether Motors platform. Carts are
persisted in **Redis** (see ADR8) with a sliding TTL so abandoned carts
expire automatically.

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

The service listens on `PORT` (default `3002`).

## Environment

| Variable             | Default                     | Description                              |
| -------------------- | --------------------------- | ---------------------------------------- |
| `PORT`               | `3002`                      | HTTP listen port                         |
| `REDIS_URL`          | `redis://redis:6379`        | Connection string to the Redis instance  |
| `REDIS_KEY_PREFIX`   | `aether:cart`               | Prefix prepended to every cart key       |
| `REDIS_TTL_SECONDS`  | `86400`                     | Sliding TTL (refreshed on every write)   |
| `PRODUCT_SERVICE_URL`| `http://product-service:3001`| Upstream product catalogue              |
| `USE_MOCK_PRODUCTS`  | `true`                      | Fall back to in-process mock catalogue   |

## API Endpoints

- `GET    /health`                              health probe (reports Redis state)
- `POST   /api/cart`                            create a new cart
- `GET    /api/cart/:cartId`                    fetch cart
- `GET    /api/cart/:cartId/items`              list items
- `GET    /api/cart/:cartId/summary`            totals only
- `POST   /api/cart/:cartId/items`              add item
- `PATCH  /api/cart/:cartId/items/:itemId`      update quantity
- `DELETE /api/cart/:cartId/items/:itemId`      remove item
- `DELETE /api/cart/:cartId`                    clear cart

## Docker

```bash
docker build -t cart-service .
docker run -p 3002:3002 -e REDIS_URL=redis://host.docker.internal:6379 cart-service
```

## Architecture

Cart state lives entirely in Redis under keys of the form
`<REDIS_KEY_PREFIX>:<cartId>`. JSON-serialised cart bodies are written with
`SET … EX <ttl>` on every mutation, so each interaction refreshes the TTL.
The previous in-memory `Map` implementation has been removed; do not
re-introduce it without first updating the deployment topology (a single
in-memory store breaks horizontal scaling – see ADR5).
