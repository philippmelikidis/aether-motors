// ---------------------------------------------------------------------------
// Aether Motors – Product Info Service client.
//
// Wraps HTTP calls to the Product Info Service (`services/product-service`)
// and translates its DB-shaped (PascalCase) responses into the camelCase
// records the EJS templates already consume.
//
// Resilience:
//   - 60 s in-process TTL cache per cache key so we do not hit the DB on
//     every page render.
//   - On HTTP / parse error we return `null` and log a warning. We do NOT
//     ship a duplicate copy of the catalogue in the backend — keeping a
//     local fallback would violate Database-per-Service (ADR7) and could
//     show stale prices to users during an outage. The calling route is
//     expected to render an explicit error / 503 page when null is returned.
//
// Images:
//   The DB ships `ImageUrl` values that point at placeholder hosts
//   (example.com / Google Stitch). Since MinIO is the source of truth
//   for media (ADR9), we IGNORE the DB-supplied URL and rebuild a media
//   URL from the slug. Mappings are stable as long as the file naming
//   convention in MinIO matches the slugs in the DB.
// ---------------------------------------------------------------------------

const axios = require('axios');
const { mediaUrl } = require('./media');

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

const REQUEST_TIMEOUT_MS = 4000;
const CACHE_TTL_MS = 60 * 1000;

// Wheel-slug → short suffix used in MinIO body-shot filenames.
// MUST stay in sync with the filenames in infrastructure/minio/seed-images/.
const WHEEL_SUFFIX = {
  'aero-blade-21':   'aero',
  'onyx-turbine-22': 'onyx',
};

// Display labels used in the merchandise tabs. The DB stores raw
// categories ('technical', 'collectibles', 'apparel'); these are purely
// presentation strings that stay hardcoded so design tweaks don't require
// a schema change.
const MERCH_CATEGORIES = ['New Arrivals', 'Collectibles', 'Technical'];

// ---------------------------------------------------------------------------
// In-process cache
// ---------------------------------------------------------------------------
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

function cacheSet(key, value, ttlMs = CACHE_TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function invalidateCache(prefix) {
  if (!prefix) return cache.clear();
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Mappers (DB shape → legacy backend shape)
// ---------------------------------------------------------------------------

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

function buildSpecs(v) {
  // The DB carries acceleration / range / top speed as separate numeric
  // + unit columns. The configurator template wants a flat array of
  // { label, value, unit } so we assemble it here.
  return [
    {
      label: 'Acceleration',
      value: v.Acceleration ? String(v.Acceleration) : '–',
      unit: v.AccelerationUnit || 's',
    },
    {
      label: 'Range',
      value: v.RangeValue ? String(v.RangeValue) : '–',
      unit: v.RangeUnit || 'km',
    },
    {
      label: 'Top Speed',
      value: v.TopSpeed ? String(v.TopSpeed) : '–',
      unit: v.TopSpeedUnit || 'km/h',
    },
  ];
}

function mapVehicle(payload) {
  const v = payload.vehicle;
  const opts = payload.options || {};
  return {
    id: v.VehicleSlug,
    name: v.Name,
    subtitle: v.Subtitle,
    image: mediaUrl(`vehicles/${v.VehicleSlug}`),
    basePrice: Number(v.BasePrice) || 0,
    specs: buildSpecs(v),
    colors: (opts.colors || []).map(mapColor),
    wheels: (opts.wheels || []).map(mapWheel),
    interiors: (opts.interiors || []).map(mapInterior),
  };
}

function mapMerchandise(row) {
  return {
    id: row.MerchandiseSlug,
    name: row.Name,
    description: row.Description,
    price: Number(row.Price) || 0,
    image: mediaUrl(`merchandise/${row.MerchandiseSlug}`),
    category: (row.Category || '').toLowerCase(),
    badge: row.Badge || undefined,
    featured: Boolean(row.Featured),
  };
}

// ---------------------------------------------------------------------------
// Body-shot helper. Naming convention:
//   vehicles/project-zenith-<colorSlug>-<wheelSuffix>.png
// Must match the filenames that landed in MinIO via the seeder.
// ---------------------------------------------------------------------------
function bodyImageFor(colorSlug, wheelSlug) {
  const suffix = WHEEL_SUFFIX[wheelSlug];
  if (!suffix) {
    return mediaUrl(`vehicles/project-zenith-${colorSlug}.png`);
  }
  return mediaUrl(`vehicles/project-zenith-${colorSlug}-${suffix}.png`);
}

// ---------------------------------------------------------------------------
// HTTP layer
// ---------------------------------------------------------------------------
async function getVehicle(slug) {
  const cacheKey = `vehicle:${slug}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const url = `${PRODUCT_SERVICE_URL}/api/vehicles/${encodeURIComponent(slug)}`;
    const res = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
    if (!res.data || !res.data.success || !res.data.vehicle) {
      throw new Error(`Unexpected payload: ${JSON.stringify(res.data).slice(0, 120)}`);
    }
    const mapped = mapVehicle(res.data);
    cacheSet(cacheKey, mapped);
    return mapped;
  } catch (err) {
    console.warn(
      `[productClient] /api/vehicles/${slug} failed (${err.message}) – returning null`
    );
    return null;
  }
}

async function getMerchandise() {
  const cacheKey = 'merchandise:all';
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const url = `${PRODUCT_SERVICE_URL}/api/merchandise`;
    const res = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
    if (!res.data || !res.data.success || !Array.isArray(res.data.data)) {
      throw new Error(`Unexpected payload: ${JSON.stringify(res.data).slice(0, 120)}`);
    }
    const products = res.data.data.map(mapMerchandise);
    const result = {
      products,
      categories: MERCH_CATEGORIES,
      productMap: Object.fromEntries(products.map((p) => [p.id, p])),
    };
    cacheSet(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(
      `[productClient] /api/merchandise failed (${err.message}) – returning empty list`
    );
    return { products: [], categories: MERCH_CATEGORIES, productMap: {} };
  }
}

module.exports = {
  getVehicle,
  getMerchandise,
  bodyImageFor,
  invalidateCache,
  // Exposed for tests / debugging
  _mappers: { mapColor, mapWheel, mapInterior, mapVehicle, mapMerchandise },
};
