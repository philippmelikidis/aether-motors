const { routeEvent } = require('../data/route');

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

module.exports = {
  formatDistanceKm,
  formatEta,
};
