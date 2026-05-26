const express = require('express');
const axios = require('axios');
const {
  routeEvent,
  countdown,
  telemetry,
  waypoints,
  mapImage,
} = require('./data/route');

const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());

// ── Presentation simulation state ──────────────────────────────────────
const PRESENTATION_SPEED_KPH = Number(process.env.PRESENTATION_SPEED_KPH) || 160;
const PRESENTATION_TICK_MS = Number(process.env.PRESENTATION_TICK_MS) || 500;

const presentationStart =
  (waypoints && waypoints.find((w) => w.type === 'start')) ||
  { name: 'Start', lat: 48.78347, lng: 9.18226 };
const presentationDestination =
  (waypoints && waypoints.find((w) => w.type === 'destination')) ||
  { name: 'Destination', lat: 48.67987, lng: 8.99943 };

const presentationRoute = [
  { lat: presentationStart.lat, lng: presentationStart.lng },
  { lat: presentationDestination.lat, lng: presentationDestination.lng },
];

let presentationTotalDistance = totalRouteDistanceMeters(presentationRoute);
let isRouteLoading = false;
let routeLoadingPromise = null;
let lastRouteMeta = null;
let routeAttempted = false; // avoid retrying OSRM on every request when it's offline

function formatDistanceKm(distanceMeters) {
  if (!Number.isFinite(distanceMeters)) return routeEvent.distance;
  const km = distanceMeters / 1000;
  return `${km.toFixed(1)} KM`;
}

function formatEta(distanceMeters, speedKph) {
  if (!Number.isFinite(distanceMeters) || !Number.isFinite(speedKph) || speedKph <= 0) {
    return null;
  }
  const hours = distanceMeters / 1000 / speedKph;
  const eta = new Date(Date.now() + hours * 3600 * 1000);
  return eta.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin',
  });
}

async function ensurePresentationRoute() {
  if (routeLoadingPromise) {
    return routeLoadingPromise;
  }
  // Once OSRM has been hit (success or fail), don't keep hammering it on
  // every roadmap request — the 2-point fallback is good enough.
  if (routeAttempted) {
    return null;
  }

  isRouteLoading = true;
  routeLoadingPromise = (async () => {
    try {
      const osrmRoute = await fetchOsrmRoute(
        presentationStart,
        presentationDestination
      );
      if (osrmRoute && Array.isArray(osrmRoute.points) && osrmRoute.points.length >= 2) {
        presentationRoute.length = 0;
        presentationRoute.push(...osrmRoute.points);
        presentationTotalDistance = totalRouteDistanceMeters(presentationRoute);
        lastRouteMeta = {
          distanceMeters: osrmRoute.distanceMeters,
          durationSeconds: osrmRoute.durationSeconds,
          updatedAt: new Date().toISOString(),
        };
        updatePresentationPosition(presentationState.distanceTraveledMeters);
      }
    } catch (err) {
      console.warn('[roadmap] OSRM route fetch failed:', err.message);
    } finally {
      isRouteLoading = false;
      routeLoadingPromise = null;
      routeAttempted = true;
    }
  })();

  return routeLoadingPromise;
}

const presentationState = {
  status: 'idle',
  position: { lat: presentationStart.lat, lng: presentationStart.lng },
  destination: {
    name: presentationDestination.name,
    position: { lat: presentationDestination.lat, lng: presentationDestination.lng },
  },
  speedKph: PRESENTATION_SPEED_KPH,
  updatedAt: new Date().toISOString(),
  progress: 0,
  distanceTraveledMeters: 0,
};

let presentationTimer = null;

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

async function fetchOsrmRoute(start, destination) {
  const url =
    `https://router.project-osrm.org/route/v1/car/` +
    `${start.lng},${start.lat};${destination.lng},${destination.lat}` +
    `?alternatives=false&steps=false&geometries=geojson&overview=full&annotations=true`;
  const response = await axios.get(url, { timeout: 4000 });
  const route = response.data.routes && response.data.routes[0];
  if (!route || !route.geometry || !Array.isArray(route.geometry.coordinates)) {
    return null;
  }
  const points = route.geometry.coordinates.map(([lng, lat]) => ({
    lat,
    lng,
  }));
  return {
    points,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
}

function totalRouteDistanceMeters(points) {
  return points.reduce((sum, point, idx) => {
    if (idx === 0) return 0;
    return sum + haversineMeters(points[idx - 1], point);
  }, 0);
}

function positionAtDistance(points, distanceMeters) {
  if (points.length === 0) return { lat: 0, lng: 0 };
  if (points.length === 1) return points[0];

  let remaining = distanceMeters;
  for (let i = 1; i < points.length; i += 1) {
    const start = points[i - 1];
    const end = points[i];
    const segment = haversineMeters(start, end);
    if (segment === 0) continue;
    if (remaining <= segment) {
      const ratio = remaining / segment;
      return {
        lat: start.lat + (end.lat - start.lat) * ratio,
        lng: start.lng + (end.lng - start.lng) * ratio,
      };
    }
    remaining -= segment;
  }
  return points[points.length - 1];
}

function updatePresentationPosition(distanceMeters) {
  const clamped = Math.max(0, Math.min(distanceMeters, presentationTotalDistance));
  presentationState.distanceTraveledMeters = clamped;
  presentationState.position = positionAtDistance(presentationRoute, clamped);
  presentationState.progress = presentationTotalDistance
    ? Math.min(100, Math.max(0, (clamped / presentationTotalDistance) * 100))
    : 0;
  presentationState.updatedAt = new Date().toISOString();
}

function getRemainingDistanceMeters() {
  return Math.max(0, presentationTotalDistance - presentationState.distanceTraveledMeters);
}

function buildPresentationCarResponse() {
  const remainingDistanceMeters = getRemainingDistanceMeters();
  const arrivalEta = presentationState.status === 'driving'
    ? formatEta(remainingDistanceMeters, presentationState.speedKph)
    : null;

  return {
    position: presentationState.position,
    status: presentationState.status,
    progress: presentationState.progress,
    speedKph: presentationState.speedKph,
    updatedAt: presentationState.updatedAt,
    distanceTraveledMeters: presentationState.distanceTraveledMeters,
    remainingDistanceMeters,
    remainingDistance: formatDistanceKm(remainingDistanceMeters),
    totalDistanceMeters: presentationTotalDistance,
    totalDistance: formatDistanceKm(presentationTotalDistance),
    arrivalEta,
  };
}

async function startPresentationSimulation() {
  await ensurePresentationRoute();
  if (presentationTimer) return;
  if (presentationState.distanceTraveledMeters >= presentationTotalDistance) {
    updatePresentationPosition(0);
  }
  presentationState.status = 'driving';
  presentationState.updatedAt = new Date().toISOString();

  presentationTimer = setInterval(() => {
    if (presentationState.status !== 'driving') return;
    const metersPerTick =
      (presentationState.speedKph * 1000) / 3600 * (PRESENTATION_TICK_MS / 1000);
    const nextDistance = Math.min(
      presentationTotalDistance,
      presentationState.distanceTraveledMeters + metersPerTick
    );
    updatePresentationPosition(nextDistance);
    if (nextDistance >= presentationTotalDistance) {
      presentationState.status = 'arrived';
      presentationState.updatedAt = new Date().toISOString();
      clearInterval(presentationTimer);
      presentationTimer = null;
    }
  }, PRESENTATION_TICK_MS);
}

function stopPresentationSimulation() {
  if (presentationTimer) {
    clearInterval(presentationTimer);
    presentationTimer = null;
  }
  presentationState.status = 'idle';
  presentationState.updatedAt = new Date().toISOString();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'roadmap-service' });
});

// ── Roadmap data ───────────────────────────────────────────────────────
app.get('/api/roadmap', async (req, res) => {
  await ensurePresentationRoute();
  const distanceMeters = lastRouteMeta ? lastRouteMeta.distanceMeters : null;
  const enrichedEvent = {
    ...routeEvent,
    distance: lastRouteMeta ? formatDistanceKm(distanceMeters) : routeEvent.distance,
    arrivalEta: presentationState.status === 'driving'
      ? formatEta(getRemainingDistanceMeters(), presentationState.speedKph)
      : null,
  };
  res.json({
    routeEvent: enrichedEvent,
    countdown,
    telemetry,
    waypoints,
    mapImage,
  });
});

// ── Presentation API ───────────────────────────────────────────────────
app.get('/api/presentation/car', (req, res) => {
  res.json(buildPresentationCarResponse());
});

app.post('/api/presentation/car', (req, res) => {
  const { lat, lng, status } = req.body || {};
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }
  stopPresentationSimulation();
  presentationState.position = { lat, lng };
  presentationState.status = status || presentationState.status || 'driving';
  const distanceFromStart = haversineMeters(presentationRoute[0], presentationState.position);
  updatePresentationPosition(distanceFromStart);
  return res.json(buildPresentationCarResponse());
});

app.post('/api/presentation/car/start', async (req, res) => {
  await startPresentationSimulation();
  res.json(buildPresentationCarResponse());
});

app.post('/api/presentation/car/stop', (req, res) => {
  stopPresentationSimulation();
  res.json(buildPresentationCarResponse());
});

app.get('/api/presentation/destination', async (req, res) => {
  await ensurePresentationRoute();
  res.json({
    destination: presentationState.destination,
    start: {
      name: presentationStart.name,
      position: { lat: presentationStart.lat, lng: presentationStart.lng },
    },
    route: presentationRoute,
  });
});

ensurePresentationRoute().catch(() => null);

app.listen(PORT, () => {
  console.log(`Roadmap Service running on port ${PORT}`);
});
