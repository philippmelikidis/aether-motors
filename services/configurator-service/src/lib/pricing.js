// ---------------------------------------------------------------------------
// Pricing calculation for vehicle configurations.
//
// All prices are in the smallest unit-less currency (USD whole dollars).
// We deliberately keep tax + total formatting out of the service layer:
// presentation formatting (currency symbol, locale) is the consumer's job.
// ---------------------------------------------------------------------------

const TAX_RATE = 0;

function computePricing({ basePrice, color, wheels, interior }) {
  const colorPrice    = Number((color    && color.price)    || 0);
  const wheelsPrice   = Number((wheels   && wheels.price)   || 0);
  const interiorPrice = Number((interior && interior.price) || 0);

  const optionsPrice = colorPrice + wheelsPrice + interiorPrice;
  const subtotal     = Number(basePrice) + optionsPrice;
  const tax          = Math.round(subtotal * TAX_RATE);
  const total        = subtotal + tax;

  return {
    basePrice: Number(basePrice),
    optionsPrice,
    subtotal,
    tax,
    total,
    currency: 'USD',
    breakdown: [
      { label: 'Base Price', value: Number(basePrice) },
      { label: color    ? `Exterior — ${color.name}`    : 'Exterior',  value: colorPrice    },
      { label: wheels   ? `Wheels — ${wheels.name}`     : 'Wheels',    value: wheelsPrice   },
      { label: interior ? `Interior — ${interior.name}` : 'Interior',  value: interiorPrice },
    ],
  };
}

module.exports = { computePricing };
