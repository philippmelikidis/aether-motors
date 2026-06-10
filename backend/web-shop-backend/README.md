# web-shop-backend

SSR-Backend and service-routing layer for the Aether Motors web shop. Built with Express and EJS, running on port 3000.

## Overview

This service handles two responsibilities:

- **SSR**: Renders EJS templates for the storefront pages, manages the cart cookie, handles form submits.
- **Service routing**: Forwards `/api/*` and `/configurator-ui/*` requests to the appropriate downstream microservices (products, cart, orders, ai, configurator). It is not a pure API gateway — it owns its own business logic (rendering, sessions) — but it acts as the single public entry point and routes everything else.

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Renders the main storefront index page |
| GET | `/api/health` | Health check — returns service status |
| ANY | `/api/products*` | Proxied to `PRODUCT_SERVICE_URL` |
| ANY | `/api/cart*` | Proxied to `CART_SERVICE_URL` |
| ANY | `/api/orders*` | Proxied to `ORDER_SERVICE_URL` |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the server listens on |
| `PRODUCT_SERVICE_URL` | `http://localhost:3001` | Base URL for the product service |
| `CART_SERVICE_URL` | `http://localhost:3002` | Base URL for the cart service |
| `ORDER_SERVICE_URL` | `http://localhost:3003` | Base URL for the order service |

## Getting Started

```bash
npm install
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Docker

```bash
docker build -t web-shop-backend .
docker run -p 3000:3000 web-shop-backend
```
