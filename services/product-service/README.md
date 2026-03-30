# Product Service

Vehicle catalog and product information service for Aether Motors.

## Overview

The Product Service provides APIs for accessing vehicle information including models, pricing, and categories.

## Installation

```bash
npm install
```

## Running

Start the service:
```bash
npm start
```

Development mode:
```bash
npm run dev
```

The service runs on port 3001 by default. Set the `PORT` environment variable to use a different port.

## Endpoints

- `GET /health` - Health check endpoint
- `GET /products` - Retrieve all available vehicles
- `GET /products/:id` - Retrieve a specific vehicle by ID

## Docker

Build the Docker image:
```bash
docker build -t product-service .
```

Run the container:
```bash
docker run -p 3001:3001 product-service
```
