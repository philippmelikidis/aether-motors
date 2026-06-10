// ---------------------------------------------------------------------------
// HTTP client for the Product Information Service.
//
// We talk to product-service over HTTP/JSON (ADR4) and transform its DB-shaped
// (PascalCase) payload into the camelCase records this service operates on.
//
// 60s in-process TTL cache reduces repeated DB hits when many configurator
// requests come in quickly (e.g. user clicking through colour swatches).
// ---------------------------------------------------------------------------

const axios = require('axios');
const {
  PRODUCT_SERVICE_URL,
  REQUEST_TIMEOUT_MS,
  CACHE_TTL_MS,
} = require('../config');
const { mediaUrl } = require('../lib/imageResolver');

const cache = new Map();

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function cacheSet(key, value) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function mapColor(row) {
  return {
    id: row.ColorSlug,
    name: row.Name,
    hex: row.HexFrom,
    hexTo: row.HexTo,
    price: Number(row.AdditionalPrice) || 0,
  };
}

function mapWheel(row) {
  return {
    id: row.WheelSlug,
    name: row.Name,
    description: row.Description,
    icon: row.IconName,
    price: Number(row.AdditionalPrice) || 0,
    image: mediaUrl(`vehicles/wheels/${row.WheelSlug}.png`),
  };
}

function mapInterior(row) {
  return {
    id: row.InteriorSlug,
    name: row.Name,
    material: row.Material,
    price: Number(row.AdditionalPrice) || 0,
    image: mediaUrl(`vehicles/interiors/${row.InteriorSlug}.png`),
  };
}

function mapVehicle(payload) {
  const v = payload.vehicle;
  const opts = payload.options || {};
  return {
    id: v.VehicleSlug,
    slug: v.VehicleSlug,
    name: v.Name,
    subtitle: v.Subtitle,
    basePrice: Number(v.BasePrice) || 0,
    colors:    (opts.colors    || []).map(mapColor),
    wheels:    (opts.wheels    || []).map(mapWheel),
    interiors: (opts.interiors || []).map(mapInterior),
  };
}

async function getVehicle(slug) {
  const key = `vehicle:${slug}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const url = `${PRODUCT_SERVICE_URL}/api/vehicles/${encodeURIComponent(slug)}`;
  const res = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
  if (!res.data || !res.data.success || !res.data.vehicle) {
    throw new Error(`Unexpected payload from product-service: ${JSON.stringify(res.data).slice(0, 120)}`);
  }
  const mapped = mapVehicle(res.data);
  cacheSet(key, mapped);
  return mapped;
}

module.exports = { getVehicle };
