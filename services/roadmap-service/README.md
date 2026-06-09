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

## Project Structure

`server.js` is a thin bootstrap that wires up the Express app and starts listening. All logic lives under `src/`, split into layers:

```
server.js                         # entry point: app.listen + initial route warm-up
src/
  app.js                          # builds the Express app and mounts routes
  config.js                       # env vars (PORT, presentation speed/tick)
  routes/
    roadmap.routes.js             # maps HTTP routes to controller handlers
  controllers/
    roadmap.controller.js         # request/response handlers (roadmap + presentation API)
  services/
    presentation.service.js       # presentation simulation state + lifecycle
  integrations/
    osrm.js                       # OSRM routing API client
  utils/
    geo.js                        # haversine distance + position interpolation
    format.js                     # distance/ETA formatting
  data/
    route.js                      # static route event, countdown, telemetry, waypoints
```

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