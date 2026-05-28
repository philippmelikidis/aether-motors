const routeEvent = {
  id: 'global-premiere',
  title: 'Global Premiere',
  location: 'HHZ Test Track',
  arrivalEta: '09:15 AM',
  distance: '12.4 KM',
};

const countdown = {
  label: 'Unveiling In',
  hours: 2,
  minutes: 48,
  seconds: 14,
};

const telemetry = {
  unitName: 'Fleet Unit 04-Z',
  unitId: '04-Z',
  progress: 65
};

const waypoints = [
    { name: 'Start', type: 'start' ,lat: 48.78347, lng: 9.18226 },
    { name: 'Destination', type:'destination', lat: 48.67987, lng: 8.99943 },
];

// Image served from MinIO (bucket: aether-images, see ADR9). The host can
// be overridden via the MEDIA_PUBLIC_URL env variable.
const MEDIA_PUBLIC_URL =
  process.env.MEDIA_PUBLIC_URL || 'http://localhost:9000/aether-images';
const mapImage = `${MEDIA_PUBLIC_URL.replace(/\/+$/, '')}/routes/zenith-route.jpg`;

module.exports = { routeEvent, countdown, telemetry, waypoints, mapImage };

