// Aether Motors – backend media URL helper.
//
// All image references in the SSR backend go through `mediaUrl(key)` rather
// than hard-coded absolute URLs. The host can be overridden via the
// MEDIA_PUBLIC_URL env variable and falls back to the docker-compose MinIO
// endpoint.
const DEFAULT_BASE = 'http://localhost:9000/aether-images';

function base() {
  return (process.env.MEDIA_PUBLIC_URL || DEFAULT_BASE).replace(/\/+$/, '');
}

function mediaUrl(key) {
  const cleaned = String(key).replace(/^\/+/, '');
  return `${base()}/${cleaned}.jpg`;
}

module.exports = { mediaUrl };
