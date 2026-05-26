# Roadmap Service

Roadmap data and presentation simulation service.

## Overview

The Roadmap Service provides route metadata, presentation telemetry, and the simulated car
movement used for the Road to the Super Car presentation.

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

The service will start on port 3007.

## API Endpoints

### Health Check
- `GET /health` - Returns service health status

### Roadmap Data
- `GET /api/roadmap` - Returns route event, countdown, telemetry, waypoints, and map image

### Presentation Simulation
- `GET /api/presentation/car` - Current car position and status
- `POST /api/presentation/car` - Update car position
- `POST /api/presentation/car/start` - Start simulation
- `POST /api/presentation/car/stop` - Stop simulation
- `GET /api/presentation/destination` - Destination and route points

## Docker

Build the image:
```bash
docker build -t roadmap-service .
```

Run the container:
```bash
docker run -p 3007:3007 roadmap-service
```

## License