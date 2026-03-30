# Route Service

Page routing and presentation logic service.

## Overview

The Route Service manages all application routes and page definitions, providing route metadata including component names, paths, and page titles used throughout the Aether Motors platform.

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm

### Installation

```bash
npm install
```

### Running the Service

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The service will start on port 3005.

## API Endpoints

### Health Check
- `GET /health` - Returns service health status

### Route Endpoints
- `GET /routes` - Retrieve all available routes
- `GET /routes/:path` - Retrieve a specific route by path

## Route Object Structure

```json
{
  "path": "/vehicles",
  "component": "VehiclesPage",
  "title": "Our Vehicles"
}
```

## Docker

Build the image:
```bash
docker build -t route-service .
```

Run the container:
```bash
docker run -p 3005:3005 route-service
```

## License

MIT
