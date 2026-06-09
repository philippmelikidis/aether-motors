const {
  routeEvent,
  countdown,
  telemetry,
  waypoints,
  mapImage,
} = require('../data/route');
const { formatDistanceKm, formatEta } = require('../utils/format');
const presentation = require('../services/presentation.service');

function health(req, res) {
  res.json({ status: 'healthy', service: 'roadmap-service' });
}

// ── Roadmap data ───────────────────────────────────────────────────────
async function getRoadmap(req, res) {
  await presentation.ensurePresentationRoute();
  const lastRouteMeta = presentation.getLastRouteMeta();
  const state = presentation.getPresentationState();
  const distanceMeters = lastRouteMeta ? lastRouteMeta.distanceMeters : null;
  const enrichedEvent = {
    ...routeEvent,
    distance: lastRouteMeta ? formatDistanceKm(distanceMeters) : routeEvent.distance,
    arrivalEta: state.status === 'driving'
      ? formatEta(presentation.getRemainingDistanceMeters(), state.speedKph)
      : null,
  };
  res.json({
    routeEvent: enrichedEvent,
    countdown,
    telemetry,
    waypoints,
    mapImage,
  });
}

// ── Presentation API ───────────────────────────────────────────────────
function getCar(req, res) {
  res.json(presentation.buildPresentationCarResponse());
}

function setCar(req, res) {
  const { lat, lng, status } = req.body || {};
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }
  return res.json(presentation.setCarPosition({ lat, lng, status }));
}

async function startCar(req, res) {
  await presentation.startPresentationSimulation();
  res.json(presentation.buildPresentationCarResponse());
}

function stopCar(req, res) {
  presentation.stopPresentationSimulation();
  res.json(presentation.buildPresentationCarResponse());
}

async function getDestination(req, res) {
  await presentation.ensurePresentationRoute();
  const state = presentation.getPresentationState();
  const presentationStart = presentation.getPresentationStart();
  res.json({
    destination: state.destination,
    start: {
      name: presentationStart.name,
      position: { lat: presentationStart.lat, lng: presentationStart.lng },
    },
    route: presentation.getPresentationRoute(),
  });
}

module.exports = {
  health,
  getRoadmap,
  getCar,
  setCar,
  startCar,
  stopCar,
  getDestination,
};
