# Aether Motors

A cloud-native automobile platform built with a microservice architecture.

## Description

Aether Motors is a modern web application for browsing, configuring, and purchasing electric vehicles. The platform is built as a distributed system using microservices, designed for scalability and independent deployment of each component.

## Architecture Overview

The system follows a **3-tier microservice architecture**:

| Tier | Components |
|------|-----------|
| **Presentation** | Web Frontend (SPA), Web Shop Backend (SSR + API Gateway) |
| **Business Logic** | Product Service, Cart Service, Order Service, Media Service, Route Service, AI Service |
| **Data** | MySQL (orders), Redis (cart/sessions), File Storage (media) |

```
┌─────────────┐
│   Frontend   │
└──────┬───────┘
       │
┌──────▼───────────────┐
│  Web Shop Backend    │  (SSR + API Gateway)
│  (Express + EJS)     │
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
| **Web Frontend** | Client-side SPA for the end user |
| **Web Shop Backend** | SSR rendering + API gateway that routes requests to downstream services |
| **Product Service** | Manages vehicle catalog, specs, and pricing |
| **Cart Service** | Handles shopping cart state (backed by Redis) |
| **Order Service** | Processes orders and checkout (backed by MySQL) |
| **Media Service** | Serves images, videos, and 3D assets |
| **Route Service** | Manages page routing and presentation logic |
| **AI Service** | Integrates Google Gemini for recommendations and chat |

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Templating:** EJS (SSR)
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
# Start all services
docker-compose up --build

# Or run a single service
cd services/product-service
npm install
npm run dev
```

The web shop backend will be available at `http://localhost:3000`.

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
| **Frontend Developer** | Web Frontend, UI/UX |
| **Backend Developer** | Web Shop Backend, API Gateway |
| **Service Developer** | Product, Cart, Order microservices |
| **Platform Engineer** | Docker, Kubernetes, CI/CD, AWS |
| **AI/ML Engineer** | AI Service, Gemini integration |

## Project Structure

```
aether-motors/
├── frontend/
├── backend/
│   └── web-shop-backend/
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
├── .github/
│   └── workflows/
├── docker-compose.yml
└── README.md
```

## License

Proprietary — All rights reserved.
