const PORT = process.env.PORT || 3007;
const PRESENTATION_SPEED_KPH = Number(process.env.PRESENTATION_SPEED_KPH) || 160;
const PRESENTATION_TICK_MS = Number(process.env.PRESENTATION_TICK_MS) || 500;

module.exports = {
  PORT,
  PRESENTATION_SPEED_KPH,
  PRESENTATION_TICK_MS,
};
