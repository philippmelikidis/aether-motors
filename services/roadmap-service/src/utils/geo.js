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

module.exports = {
  haversineMeters,
  totalRouteDistanceMeters,
  positionAtDistance,
};
