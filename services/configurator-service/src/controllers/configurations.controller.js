// ---------------------------------------------------------------------------
// Configurations controller.
//
// Endpoints:
//   GET  /api/configurations/options/:vehicleSlug
//        Returns the full option tree for a vehicle (colors / wheels /
//        interiors) plus the canonical defaults the consumer should
//        preselect.
//
//   POST /api/configurations/build
//        Takes a (vehicleSlug, color, wheels, interior) selection,
//        validates each id against the vehicle's option tree, falls back
//        to the first option if an id is unknown, computes pricing and
//        resolves the matching pre-rendered body-shot image. Returns a
//        complete "ready-to-render" configuration document.
//
// This service is intentionally stateless. It owns no persistence — every
// request is independent. That keeps it horizontally scalable per ADR5.
// ---------------------------------------------------------------------------

const { getVehicle } = require('../integrations/product-service');
const { bodyImageFor } = require('../lib/imageResolver');
const { computePricing } = require('../lib/pricing');

function pick(list, id) {
  return (list || []).find((item) => item.id === id) || (list || [])[0];
}

async function getOptions(req, res, next) {
  try {
    const vehicle = await getVehicle(req.params.vehicleSlug);
    res.json({
      success: true,
      data: {
        vehicle: {
          slug: vehicle.slug,
          name: vehicle.name,
          subtitle: vehicle.subtitle,
          basePrice: vehicle.basePrice,
        },
        options: {
          colors:    vehicle.colors,
          wheels:    vehicle.wheels,
          interiors: vehicle.interiors,
        },
        defaults: {
          color:    vehicle.colors[0]    && vehicle.colors[0].id    || null,
          wheels:   vehicle.wheels[0]    && vehicle.wheels[0].id    || null,
          interior: vehicle.interiors[0] && vehicle.interiors[0].id || null,
        },
      },
    });
  } catch (err) {
    console.warn(`[configurator] getOptions failed: ${err.message}`);
    res.status(502).json({ success: false, error: 'product_service_unavailable' });
  }
}

async function buildConfiguration(req, res, next) {
  const { vehicleSlug, color, wheels, interior } = req.body || {};
  if (!vehicleSlug) {
    return res.status(400).json({ success: false, error: 'vehicleSlug_required' });
  }

  let vehicle;
  try {
    vehicle = await getVehicle(vehicleSlug);
  } catch (err) {
    console.warn(`[configurator] buildConfiguration: product-service failed: ${err.message}`);
    return res.status(502).json({ success: false, error: 'product_service_unavailable' });
  }

  const selectedColor    = pick(vehicle.colors,    color);
  const selectedWheel    = pick(vehicle.wheels,    wheels);
  const selectedInterior = pick(vehicle.interiors, interior);

  if (!selectedColor || !selectedWheel || !selectedInterior) {
    return res.status(404).json({ success: false, error: 'vehicle_options_missing' });
  }

  const pricing = computePricing({
    basePrice: vehicle.basePrice,
    color: selectedColor,
    wheels: selectedWheel,
    interior: selectedInterior,
  });

  const bodyImage = bodyImageFor(vehicle.slug, selectedColor.id, selectedWheel.id);

  // Flag if the consumer passed an unknown id (we silently fell back).
  const fellBack = {
    color:    Boolean(color)    && color    !== selectedColor.id,
    wheels:   Boolean(wheels)   && wheels   !== selectedWheel.id,
    interior: Boolean(interior) && interior !== selectedInterior.id,
  };

  res.json({
    success: true,
    data: {
      vehicle: {
        slug: vehicle.slug,
        name: vehicle.name,
        subtitle: vehicle.subtitle,
        basePrice: vehicle.basePrice,
      },
      selections: {
        color:    selectedColor,
        wheels:   selectedWheel,
        interior: selectedInterior,
      },
      pricing,
      bodyImage,
      meta: { fellBack },
    },
  });
}

module.exports = { getOptions, buildConfiguration };
