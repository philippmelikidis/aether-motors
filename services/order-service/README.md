# Order Service

Order processing and checkout service for Aether Motors.

## Overview

The Order Service manages order creation, retrieval, and processing. It currently uses an in-memory store and will be integrated with a MySQL database in the future.

## Quick Start

```bash
npm install
npm start
```

The service will start on port 3003 (configurable via `PORT` environment variable).

## API Endpoints

### Health Check
- **GET** `/health` - Service health status

### Get Orders
- **GET** `/orders/:userId` - Retrieve all orders for a specific user

### Create Order
- **POST** `/orders` - Create a new order
  - Request body: `{ userId, items, total }`

## Development

```bash
npm run dev
```

Runs the service with nodemon for automatic reloading.
