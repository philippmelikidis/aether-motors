/**
 * Aether Motors – Media URL helper.
 *
 * All image references in the frontend go through `mediaUrl(key)` rather than
 * hard-coding absolute URLs. The base of the URL is picked up from
 * `NEXT_PUBLIC_MEDIA_URL` at build time and falls back to the MinIO endpoint
 * exposed by docker-compose (`http://localhost:9000/aether-images`).
 *
 * Object keys correspond 1:1 to the entries in
 * `infrastructure/minio/seed-manifest.json`. By default the URL gets a `.jpg`
 * extension appended, but keys that already contain an extension (e.g.
 * `vehicles/wheels/aero-blade-21.png`) keep theirs verbatim - use this for
 * transparent PNG overlays in the configurator.
 */
const DEFAULT_BASE = "http://localhost:9000/aether-images";
const KNOWN_EXTENSIONS = /\.(png|jpg|jpeg|webp|svg|gif)$/i;

function resolveBase(): string {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_MEDIA_URL
      : undefined;
  return (fromEnv ?? DEFAULT_BASE).replace(/\/+$/, "");
}

/**
 * Build a public MinIO URL for a given asset key.
 * - `mediaUrl("merchandise/hero")` → `http://.../aether-images/merchandise/hero.jpg`
 * - `mediaUrl("vehicles/wheels/aero.png")` → `http://.../aether-images/vehicles/wheels/aero.png`
 */
export function mediaUrl(key: string): string {
  const cleaned = key.replace(/^\/+/, "");
  const withExt = KNOWN_EXTENSIONS.test(cleaned) ? cleaned : `${cleaned}.jpg`;
  return `${resolveBase()}/${withExt}`;
}
