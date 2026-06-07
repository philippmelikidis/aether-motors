// ---------------------------------------------------------------------------
// Aether Motors – backend media URL helper.
//
// All image references in the SSR backend go through `mediaUrl(key)` rather
// than hard-coded absolute URLs. The host comes from the MEDIA_PUBLIC_URL
// env var (set in docker-compose) and falls back to the local MinIO endpoint.
//
// Keys WITHOUT an extension get `.jpg` appended automatically. Keys WITH a
// known image extension (`.png`, `.webp`, `.svg`, …) keep theirs verbatim —
// this is how the configurator references transparent-PNG wheel overlays.
// ---------------------------------------------------------------------------
const DEFAULT_BASE = 'http://localhost:9000/aether-images';
const KNOWN_EXTENSIONS = /\.(png|jpg|jpeg|webp|svg|gif)$/i;

function base() {
  return (process.env.MEDIA_PUBLIC_URL || DEFAULT_BASE).replace(/\/+$/, '');
}

function mediaUrl(key) {
  const cleaned = String(key).replace(/^\/+/, '');
  const withExt = KNOWN_EXTENSIONS.test(cleaned) ? cleaned : `${cleaned}.jpg`;
  return `${base()}/${withExt}`;
}

module.exports = { mediaUrl };
