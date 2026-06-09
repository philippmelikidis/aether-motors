const axios = require('axios');

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

module.exports = { fetchOsrmRoute };
