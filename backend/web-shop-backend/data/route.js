const { mediaUrl } = require('../lib/media');
const routeEvent = {
  id: 'global-premiere',
  title: 'Global Premiere',
  location: 'Stuttgart Test Track',
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
  progress: 65,
  viewMode: '3D Cinematic',
  syncStatus: 'Connected',
};

const waypoints = [
  { name: 'Stuttgart Test Track', type: 'start', lat: 48.7758, lng: 9.1829 },
  { name: 'Zenith Pavilion', type: 'destination', lat: 48.7831, lng: 9.1802 },
];

const mapImage =
  mediaUrl('routes/zenith-route');

module.exports = { routeEvent, countdown, telemetry, waypoints, mapImage };
