// ---------------------------------------------------------------------------
// Image URL resolution — turns asset slugs into full MinIO URLs and
// derives the pre-rendered body-shot filename from (colorSlug, wheelSlug).
//
// Naming convention (must stay in sync with the seeded files in
// infrastructure/minio/seed-images/vehicles/):
//   vehicles/project-zenith-<colorSlug>-<wheelSuffix>.png
//
// If a wheel slug is not in WHEEL_SUFFIX, we fall back to a colour-only
// filename (vehicles/project-zenith-<colorSlug>.png).
// ---------------------------------------------------------------------------

const { MEDIA_PUBLIC_URL } = require('../config');

const KNOWN_EXTENSIONS = /\.(png|jpg|jpeg|webp|svg|gif)$/i;

const WHEEL_SUFFIX = {
  'aero-blade-21':   'aero',
  'onyx-turbine-22': 'onyx',
};

function base() {
  return String(MEDIA_PUBLIC_URL).replace(/\/+$/, '');
}

function mediaUrl(key) {
  const cleaned = String(key).replace(/^\/+/, '');
  const withExt = KNOWN_EXTENSIONS.test(cleaned) ? cleaned : `${cleaned}.jpg`;
  return `${base()}/${withExt}`;
}

function bodyImageFor(vehicleSlug, colorSlug, wheelSlug) {
  const suffix = WHEEL_SUFFIX[wheelSlug];
  if (!suffix) {
    return mediaUrl(`vehicles/${vehicleSlug}-${colorSlug}.png`);
  }
  return mediaUrl(`vehicles/${vehicleSlug}-${colorSlug}-${suffix}.png`);
}

module.exports = { mediaUrl, bodyImageFor };
