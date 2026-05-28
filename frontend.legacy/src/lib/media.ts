/**
 * Aether Motors – Media URL helper.
 *
 * All image references in the frontend go through `mediaUrl(key)` rather than
 * hard-coding absolute URLs. The base of the URL is picked up from
 * `NEXT_PUBLIC_MEDIA_URL` at build time and falls back to the MinIO endpoint
 * exposed by docker-compose (`http://localhost:9000/aether-images`).
 *
 * Object keys correspond 1:1 to the entries in
 * `infrastructure/minio/seed-manifest.json`. Every key is suffixed with `.jpg`
 * when the URL is materialised, so callers pass the bare key (e.g.
 * `gallery/the-cockpit`).
 */
const DEFAULT_BASE = "http://localhost:9000/aether-images";

function resolveBase(): string {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_MEDIA_URL
      : undefined;
  return (fromEnv ?? DEFAULT_BASE).replace(/\/+$/, "");
}

/** Build a public MinIO URL for a given asset key (without extension). */
export function mediaUrl(key: string): string {
  const cleaned = key.replace(/^\/+/, "");
  return `${resolveBase()}/${cleaned}.jpg`;
}
