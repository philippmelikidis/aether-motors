// ---------------------------------------------------------------------------
// Page controller — renders the embeddable configurator HTML page.
//
// This is the entry point for the iframe. Reads the (color, wheels, interior)
// from the query string, validates via the same logic as the JSON API,
// and renders the EJS template.
//
// The asset base path is read from the request so the rendered HTML works
// in two scenarios:
//   * standalone: assetBase = "" (e.g. http://localhost:3008/)
//   * embedded via backend proxy: assetBase = "/configurator-ui"
// The backend passes its prefix via X-Forwarded-Prefix header.
// ---------------------------------------------------------------------------

const { getVehicle } = require('../integrations/product-service');
const { bodyImageFor, mediaUrl } = require('../lib/imageResolver');
const { computePricing } = require('../lib/pricing');

const DEFAULT_VEHICLE_SLUG = 'project-zenith';

function pick(list, id) {
  return (list || []).find((item) => item.id === id) || (list || [])[0];
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

async function renderConfiguratorPage(req, res) {
  let vehicle;
  try {
    vehicle = await getVehicle(DEFAULT_VEHICLE_SLUG);
  } catch (err) {
    console.warn(`[configurator-service] product-service failed: ${err.message}`);
    return res.status(503).send(
      `<!doctype html><html><body style="background:#121314;color:#e3e2e3;font-family:sans-serif;padding:40px;">
       <h1 style="color:#00daf8;">Configurator briefly offline</h1>
       <p>The product service is not reachable. Please retry shortly.</p></body></html>`
    );
  }

  const selectedColor    = pick(vehicle.colors,    req.query.color);
  const selectedWheel    = pick(vehicle.wheels,    req.query.wheels);
  const selectedInterior = pick(vehicle.interiors, req.query.interior);

  const pricing = computePricing({
    basePrice: vehicle.basePrice,
    color: selectedColor,
    wheels: selectedWheel,
    interior: selectedInterior,
  });

  const bodyImage = bodyImageFor(vehicle.slug, selectedColor.id, selectedWheel.id);
  const placeholderImage = mediaUrl('vehicles/project-zenith.jpg');

  // Honour X-Forwarded-Prefix when behind a proxy.
  const assetBase = (req.get('X-Forwarded-Prefix') || '').replace(/\/+$/, '');

  res.render('configurator', {
    assetBase,
    vehicle,
    selectedColor,
    selectedWheel,
    selectedInterior,
    bodyImage,
    placeholderImage,
    totalPrice: pricing.total,
    pricing,
    formatPrice,
  });
}

module.exports = { renderConfiguratorPage };
