// ---------------------------------------------------------------------------
// Aether Motors – Configurator Service client.
//
// Wraps HTTP calls to the Configurator Service (services/configurator-service).
// All configurator pricing + image-resolution logic lives in that service
// since the Configurator was extracted into its own microservice; the SSR
// backend is the consumer, not the owner, of that logic.
// ---------------------------------------------------------------------------

const axios = require('axios');

const CONFIGURATOR_SERVICE_URL =
  process.env.CONFIGURATOR_SERVICE_URL || 'http://localhost:3008';

const REQUEST_TIMEOUT_MS = 4000;

async function build({ vehicleSlug, color, wheels, interior }) {
  try {
    const url = `${CONFIGURATOR_SERVICE_URL}/api/configurations/build`;
    const res = await axios.post(
      url,
      { vehicleSlug, color, wheels, interior },
      { timeout: REQUEST_TIMEOUT_MS }
    );
    if (!res.data || !res.data.success) {
      throw new Error(`Unexpected payload: ${JSON.stringify(res.data).slice(0, 120)}`);
    }
    return res.data.data;
  } catch (err) {
    console.warn(
      `[configuratorClient] /api/configurations/build failed (${err.message}) – returning null`
    );
    return null;
  }
}

async function getOptions(vehicleSlug) {
  try {
    const url = `${CONFIGURATOR_SERVICE_URL}/api/configurations/options/${encodeURIComponent(vehicleSlug)}`;
    const res = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
    if (!res.data || !res.data.success) {
      throw new Error(`Unexpected payload: ${JSON.stringify(res.data).slice(0, 120)}`);
    }
    return res.data.data;
  } catch (err) {
    console.warn(
      `[configuratorClient] /api/configurations/options/${vehicleSlug} failed (${err.message}) – returning null`
    );
    return null;
  }
}

module.exports = { build, getOptions };
