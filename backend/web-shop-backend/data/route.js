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
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCdRWEj3FZzXaLGAaLIRfy592M5wW00OPxp57JbrcF-2Hf8ApjExUelJ782u2HmUpRhRkh7FO6DalSdAMtp2Mw5_MTiSPbCBTOJPdQl2C_p_TIbCJJq9sJ6wjd0v-S-7auw3iWW2j8HADz03_pdcpR91N6MzbOFWDvbsjnK_jc7xyMRZWNAemWPo9lRwy0v_sDsIapjc8jemSWtQTfzsmas420ujThMZ-0J2pK9DZOlleqoECcpj_XF7Ix1rnBZhQTrKhVjCcw7UtbG=w2048';

module.exports = { routeEvent, countdown, telemetry, waypoints, mapImage };
