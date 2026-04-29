# Aether Motors

A cloud-native automobile platform built with a microservice architecture and a fully server-side rendered web shop.

## Description

Aether Motors is a modern web application for browsing, configuring, and purchasing electric vehicles. The platform is built as a distributed system using microservices, with a server-side rendered presentation tier — every page is delivered as fully-rendered HTML by the web-shop-backend, which also acts as the API gateway to all downstream services.

## Architecture Overview

The system follows a **3-tier microservice architecture**:

| Tier | Components |
|------|-----------|
| **Presentation** | Web Shop Backend (SSR + API Gateway) — renders HTML with EJS, ships pure CSS (Tailwind build step) and small Vanilla-JS islands |
| **Business Logic** | Product Service, Cart Service, Order Service, Media Service, Route Service, AI Service |
| **Data** | MySQL (orders), Redis (cart/sessions), File Storage (media) |

```
┌──────────────────────┐
│  Browser              │  receives ready-rendered HTML + CSS + tiny JS
└──────┬───────────────┘
       │ HTTP
┌──────▼───────────────┐
│  Web Shop Backend    │  SSR (Express + EJS) + API Gateway
│  Port 3000           │  proxies /api/* to downstream services
└──────┬───────────────┘
       │
┌──────▼───────────────────────────────────────────┐
│  Microservices                                    │
│  ┌─────────┐ ┌──────┐ ┌───────┐ ┌───────┐       │
│  │ Product │ │ Cart │ │ Order │ │ Media │ ...    │
│  └─────────┘ └──────┘ └───────┘ └───────┘       │
└──────────────────────────────────────────────────┘
```

## Services Overview

| Service | Description |
|---------|-------------|
| **Web Shop Backend** | SSR rendering of every page (Home, Configurator, Gallery, Merchandise, Cart, Roadmap) plus API gateway that routes requests to downstream services |
| **Product Service** | Manages vehicle catalog, specs, and pricing |
| **Cart Service** | Handles shopping cart state (backed by Redis) |
| **Order Service** | Processes orders and checkout (backed by MySQL) |
| **Media Service** | Serves images, videos, and 3D assets |
| **Route Service** | Manages page routing and presentation logic |
| **AI Service** | Integrates Google Gemini for recommendations and chat |

## Tech Stack

- **Runtime:** Node.js 18+
- **Web framework:** Express
- **Templating:** EJS with `express-ejs-layouts` (server-side rendering)
- **Styling:** Tailwind CSS — compiled at build time to a single static CSS file (the browser receives plain CSS only)
- **Client interactivity:** Vanilla JavaScript (small islands for menu toggle, countdown, etc.)
- **State:**
  - Configurator → URL query params (`?color=&wheels=&interior=`)
  - Cart → HTTP-only cookie (`aether_cart_id`) backed by cart-service
- **Databases:** MySQL, Redis
- **Containerization:** Docker, Docker Compose
- **Orchestration:** Kubernetes (production)
- **CI/CD:** GitHub Actions
- **Cloud:** AWS Elastic Beanstalk

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose

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

| Service | Port |
|---------|------|
| Web Shop Backend | 3000 |
| Product Service | 3001 |
| Cart Service | 3002 |
| Order Service | 3003 |
| Media Service | 3004 |
| Route Service | 3005 |
| AI Service | 3006 |

## Deployment

Production deployment targets **AWS Elastic Beanstalk** with the following strategy:

1. Each service is containerized and pushed to ECR
2. Elastic Beanstalk multi-container Docker environments run each service
3. An Application Load Balancer routes traffic to the web shop backend
4. Internal service communication happens over a private VPC network
5. RDS (MySQL) and ElastiCache (Redis) provide managed data stores

## Team Structure

| Role | Responsibility |
|------|---------------|
| **Frontend / SSR Developer** | Web Shop Backend views, partials, Tailwind, Vanilla-JS islands |
| **Backend Developer** | Web Shop Backend routing, API gateway, cart-service integration |
| **Service Developer** | Product, Cart, Order microservices |
| **Platform Engineer** | Docker, Kubernetes, CI/CD, AWS |
| **AI/ML Engineer** | AI Service, Gemini integration |

## Project Structure

```
aether-motors/
├── backend/
│   └── web-shop-backend/      ← SSR site + API gateway (entry point)
│       ├── views/             ← EJS templates (pages + partials)
│       ├── public/            ← compiled CSS + Vanilla-JS
│       ├── data/              ← static catalog data (vehicles, merchandise, gallery, route)
│       ├── src/input.css      ← Tailwind source
│       ├── tailwind.config.js
│       └── server.js
├── services/
│   ├── product-service/
│   ├── cart-service/
│   ├── order-service/
│   ├── media-service/
│   ├── route-service/
│   └── ai-service/
├── infrastructure/
│   ├── docker/
│   └── kubernetes/
├── docs/
├── frontend.legacy/            ← OLD Next.js SPA — replaced by SSR in web-shop-backend, kept as backup
├── .github/
│   └── workflows/
├── docker-compose.yml
└── README.md
```

> **Note:** The original `frontend/` (Next.js + React + TypeScript SPA) was replaced by exclusive server-side rendering in the web-shop-backend. The legacy code is preserved in `frontend.legacy/` for reference but is not part of the runtime build or the docker-compose stack.

## License

Proprietary — All rights reserved.
