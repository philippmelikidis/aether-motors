# Product Service

Product information and configuration API service for Aether Motors.

## Overview

The Product Service provides JSON API endpoints for vehicles, merchandise, search, and configuration options.

It is designed as a backend microservice that can be consumed by frontend applications, mobile apps, or other internal services.

The service uses a MySQL database and supports filtering, product configuration options, and search functionality.

---
## Quick Start

```bash
npm install
npm start
```

PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=aether_motors

The service will start on port 3001 (configurable via `PORT` environment variable).

## API Endpoints

### Health Check
- **GET** `/health` - Service health status

## Vehicles API

### Get Vehicles
**GET** `/api/vehicles`

Optional query parameters:
- minPrice
- maxPrice
- minHorsepower
- maxHorsepower
- minRange
- maxRange
- seats

---

### Get Vehicle Details
**GET** `/api/vehicles/:slug`

Returns:
- Vehicle data
- Available colors
- Wheels
- Interiors
- Suspensions
- Exhausts

---

## Merchandise API

### Get Merchandise
**GET** `/api/merchandise`

Optional query parameters:
- category
- minPrice
- maxPrice
- featured
- search

---

### Get Merchandise Details
**GET** `/api/merchandise/:slug`

---

### Get Merchandise Categories
**GET** `/api/merchandise/categories`

---

## Options API

### Get Colors
**GET** `/api/options/colors`

### Get Wheels
**GET** `/api/options/wheels`

### Get Interiors
**GET** `/api/options/interiors`

### Get Suspensions
**GET** `/api/options/suspensions`

### Get Exhausts
**GET** `/api/options/exhausts`

---

## Search API

### Search Products
**GET** `/api/search?q=query`

Searches:
- Vehicles
- Merchandise

---

## Filter API

### Get Price Ranges
**GET** `/api/filters/price-ranges`

Returns:
- Vehicle min/max prices
- Merchandise min/max prices

Runs the service with nodemon for automatic reloading.