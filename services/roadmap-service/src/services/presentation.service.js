const { waypoints } = require('../data/route');
const { PRESENTATION_SPEED_KPH, PRESENTATION_TICK_MS } = require('../config');
const {
  haversineMeters,
  totalRouteDistanceMeters,
  positionAtDistance,
} = require('../utils/geo');
const { formatDistanceKm, formatEta } = require('../utils/format');
const { fetchOsrmRoute } = require('../integrations/osrm');

// ── Presentation simulation state ──────────────────────────────────────
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

function setCarPosition({ lat, lng, status }) {
  stopPresentationSimulation();
  presentationState.position = { lat, lng };
  presentationState.status = status || presentationState.status || 'driving';
  const distanceFromStart = haversineMeters(presentationRoute[0], presentationState.position);
  updatePresentationPosition(distanceFromStart);
  return buildPresentationCarResponse();
}

function getPresentationState() {
  return presentationState;
}

function getLastRouteMeta() {
  return lastRouteMeta;
}

function getPresentationRoute() {
  return presentationRoute;
}

function getPresentationStart() {
  return presentationStart;
}

module.exports = {
  ensurePresentationRoute,
  updatePresentationPosition,
  getRemainingDistanceMeters,
  buildPresentationCarResponse,
  startPresentationSimulation,
  stopPresentationSimulation,
  setCarPosition,
  getPresentationState,
  getLastRouteMeta,
  getPresentationRoute,
  getPresentationStart,
};
