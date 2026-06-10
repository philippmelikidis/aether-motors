# Aether Motors

A cloud-native automobile platform built with a microservice architecture and a fully server-side rendered web shop.

## Description

Aether Motors is a modern web application for browsing, configuring, and purchasing electric vehicles. The platform is built as a distributed system using microservices, with a server-side rendered presentation tier — every page is delivered as fully-rendered HTML by the web-shop-backend, which also handles service routing (HTTP forwarding, proxying) to the downstream microservices. It is not a pure API gateway — it owns the SSR pages, the form-handling and the cart cookie — but it acts as the single public entry point and routes all traffic to the right service.

## Architecture Overview

The system follows a **3-tier microservice architecture** with strict
database-per-service separation:

| Tier | Components |
|------|-----------|
| **Presentation** | Web Shop Backend (SSR + service routing) — renders HTML with EJS, ships pure CSS (Tailwind build step) and small Vanilla-JS islands; also forwards `/api/*` and `/configurator-ui/*` to the right microservice |
| **Business Logic** | Product, Cart, Order, Media, Roadmap, AI, Configurator |
| **Data** | MySQL (catalog) · MySQL (orders) · Redis (cart) · MinIO (media) |

```
┌──────────────────────────┐
│  Browser                  │  receives ready-rendered HTML + CSS + tiny JS
└──────┬───────────────────┘
       │ HTTP
┌──────▼───────────────────┐
│  Web Shop Backend        │  SSR (Express + EJS) + service routing
│  Port 3000               │  forwards /api/* and /configurator-ui/* to services
└──┬───────────────────┬───┘
   │                   │
   │ HTTP/JSON         │ direct image GET (anon read)
   ▼                   │
┌────────────────────┐ │
│  Microservices         │ │
│  Product      (3001)   │ │
│  Cart         (3002)   │ │
│  Order        (3003)   │ │
│  Media        (3004)   │ │
│  AI           (3006)   │ │
│  Roadmap      (3007)   │ │
│  Configurator (3008)   │ │
└─┬─────┬───────┬─┬──────┘ │
  │     │       │ │    │
  ▼     ▼       ▼ ▼    ▼
┌─────┐┌─────┐┌────┐┌──────┐
│MySQL││Redis││MySQL││MinIO │
│cat. ││cart ││ord. ││media │
└─────┘└─────┘└────┘└──────┘
```

## Services Overview

| Service | Description | Storage |
|---|---|---|
| **Web Shop Backend** | SSR of every page (Home, Configurator, Gallery, Merchandise, Cart, Roadmap) plus routing/forwarding to downstream services. Pulls vehicle + merchandise data from the Product Service over HTTP/JSON (in-process 60s cache); proxies `/configurator-ui/*` to the Configurator Service and `/api/ai/*` to the AI Service; never touches a database directly. | — |
| **Product Service** | Vehicles + Merchandise catalogue with configurator options (colors, wheels, interiors, suspensions, exhausts). Exposes REST/JSON. | MySQL (`aether_motors`) |
| **Cart Service** | Shopping cart state with sliding TTL (24h default). Cart documents stored as JSON under `aether:cart:<id>`. | Redis (AOF-persisted) |
| **Order Service** | Persists vehicle + merchandise orders, status flow (pending → confirmed), exposes order-history endpoints. | MySQL (`aether_orders`) |
| **Media Service** | Catalog façade over MinIO. Lists/inspects objects in the `aether-images` bucket; the SSR backend hot-links objects directly. | MinIO bucket |
| **Roadmap Service** | Product roadmap (milestones, releases, marketing phases). | — (in-memory) |
| **AI Service** | Google Gemini wrapper for natural-language configuration. Responds with HTTP 503 (`gemini_api_key_missing`) when no API key is set, and HTTP 502 (`gemini_call_failed`) when the upstream call fails. No silent fallback — failures are surfaced to the caller. | — (consumes Product Service) |
| **Configurator Service** | Vehicle-configuration **micro-frontend**. Renders its own EJS+Tailwind+JS UI (body shot, color/wheel/interior selectors, AI panel, checkout button) and embeds back into the SSR backend's `/configurator` page via `<iframe>`. Owns the configuration domain logic (option validation, pricing with breakdown, MinIO image resolution). Stateless; checkout hand-off via `postMessage`. | — (consumes Product Service) |

## Tech Stack

- **Runtime:** Node.js 18+
- **Web framework:** Express
- **Templating:** EJS with `express-ejs-layouts` (server-side rendering)
- **Styling:** Tailwind CSS — compiled at build time to a single static CSS file (the browser receives plain CSS only)
- **Client interactivity:** Vanilla JavaScript (small islands for menu toggle, countdown, etc.)
- **State:**
  - Configurator → URL query params (`?color=&wheels=&interior=`)
  - Cart → HTTP-only cookie (`aether_cart_id`) backed by cart-service
- **Databases:** MySQL × 2 (catalog + orders, one per service per ADR7), Redis (cart cache), MinIO (S3-compatible object storage for media)
- **Containerization:** Docker, Docker Compose (one image per service)
- **Orchestration:** Kubernetes (production)
- **CI/CD:** GitHub Actions
- **Cloud (target):** AWS — Elastic Beanstalk for the SSR backend, ECS Fargate for the microservices, RDS for MySQL, ElastiCache for Redis, S3 for media

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose

### Configuration

The AI Service needs a Google Gemini API key. Copy the template and insert your key:

```bash
cp .env.example .env
# then edit .env and set GEMINI_API_KEY=your_key_here
```

Docker Compose loads this root-level `.env` automatically. The real `.env` is
gitignored, so the key is never committed. Without a key, `POST /ai/configure`
responds with HTTP 503 (the rest of the platform still works).

### Local Development

```bash
# Start everything (web-shop-backend + microservices + Redis + MySQL)
docker-compose up --build

# Or run only the web-shop-backend (SSR site) standalone
cd backend/web-shop-backend
npm install
npm run dev   # rebuilds Tailwind on change AND restarts server on change
```

The site is then served at `http://localhost:3000`.

The dev script does two things in parallel via `concurrently`:
1. `tailwindcss --watch` — recompiles `public/css/app.css` whenever a class is added in any `.ejs` file
2. `node --watch server.js` — restarts the server on any source change

### Building for production

```bash
cd backend/web-shop-backend
npm install
npm start   # runs build:css then starts the server
```

The Dockerfile follows the same multi-stage pattern: a build stage compiles Tailwind to a minified CSS file, and the runtime stage only contains `views/`, `public/`, `server.js` and the production node_modules.

### Service Ports

| Service | Port (host) |
|---|---|
| Web Shop Backend | 3000 |
| Product Service | 3001 |
| Cart Service | 3002 |
| Order Service | 3003 |
| Media Service | 3004 |
| AI Service | 3006 |
| Roadmap Service | 3007 |
| Configurator Service | 3008 |
| MinIO (S3 API) | 9000 |
| MinIO (Web Console) | 9001 |
| MySQL (catalog) | 3306 |
| MySQL (orders) | 3307 |
| Redis | 6379 |
| Adminer (both MySQLs) | 8080 |

## Deployment

Production deployment targets **AWS** with the following strategy:

1. Each service is containerized and pushed to ECR
2. The SSR `web-shop-backend` runs on **AWS Elastic Beanstalk** (elastic horizontal scaling behind an Application Load Balancer, see DDR3)
3. The microservices run on **AWS ECS Fargate** (one task definition per service, see DDR4)
4. Internal service communication happens over a private VPC network
5. **AWS RDS for MySQL** provides the catalogue and orders databases as separate instances (see DDR5)
6. **AWS ElastiCache for Redis** backs the cart cache (see DDR6)
7. **AWS S3** serves media (the on-prem MinIO bucket migrates by configuration only — same API, see DDR7)
8. Secrets are injected via **AWS Secrets Manager** (see DDR8)

## Team Structure

| Role | Responsibility |
|------|---------------|
| **Frontend / SSR Developer** | Web Shop Backend views, partials, Tailwind, Vanilla-JS islands |
| **Backend Developer** | Web Shop Backend routing, service forwarding, cart-service integration |
| **Service Developer** | Product, Cart, Order microservices |
| **Platform Engineer** | Docker, Kubernetes, CI/CD, AWS |
| **AI/ML Engineer** | AI Service, Gemini integration |

## Project Structure

```
aether-motors/
├── backend/
│   └── web-shop-backend/      ← SSR site + service routing (entry point)
│       ├── views/             ← EJS templates (pages + partials)
│       ├── public/            ← compiled CSS + Vanilla-JS
│       ├── lib/               ← productClient (Product Info Service HTTP wrapper) + media helper
│       ├── data/              ← presentation-only data (gallery, route) — product data comes from the DB via the product-service
│       ├── src/input.css      ← Tailwind source
│       ├── tailwind.config.js
│       └── server.js
├── services/
│   ├── product-service/        ← MySQL-backed catalogue (vehicles, merchandise, options)
│   ├── cart-service/           ← Redis-backed cart store
│   ├── order-service/
│   ├── media-service/          ← MinIO metadata façade
│   ├── roadmap-service/
│   ├── ai-service/             ← Gemini wrapper (HTTP 503/502 on missing key or call failure)
│   └── configurator-service/   ← vehicle configuration MICRO-FRONTEND (own UI, embedded via iframe)
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── minio/                  ← MinIO init-container + image seed manifest
├── docs/                       ← Architekturdokumentation & -modellierung
├── .github/
│   └── workflows/
├── docker-compose.yml
└── README.md
```

> **Note:** Aether Motors is delivered exclusively via server-side rendering. The web-shop-backend (Express + EJS) renders every page and forwards service traffic to the downstream microservices — it owns the SSR layer, not a thin pass-through gateway. Client-side rendering and SPA frameworks (React, Next.js) are intentionally not part of the runtime — see ADR3.

## License

Proprietary — All rights reserved.
