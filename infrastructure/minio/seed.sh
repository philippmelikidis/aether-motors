#!/bin/sh
# -----------------------------------------------------------------------------
# Aether Motors – MinIO bucket bootstrap & image seeding.
#
# Runs once per `docker compose up`. Tasks:
#   1) Wait for the MinIO API to become reachable.
#   2) Create (if missing) the `aether-images` bucket and make it publicly
#      readable so the SSR frontend can hot-link the objects.
#   3) For every asset key in /seed-manifest.json:
#        a) If /seed-images/<key>.jpg exists locally → upload it as-is.
#        b) Otherwise, try downloading from the URL listed in the manifest.
#        c) Otherwise, log a warning and continue.
#
# Re-runs are safe: objects that already exist in MinIO are skipped.
# The manifest is parsed with grep + sed only (see infrastructure/minio/
# Dockerfile, which guarantees those tools are present). Keep the format
# simple — one "key": "url" pair per line, both quoted.
# -----------------------------------------------------------------------------

set -e

MINIO_HOST="${MINIO_HOST:-minio}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_ALIAS="aether"
MINIO_USER="${MINIO_ROOT_USER:-aether_admin}"
MINIO_PASS="${MINIO_ROOT_PASSWORD:-aether_secret_change_me}"

LOCAL_SEED_DIR="/seed-images"
DOWNLOAD_TIMEOUT="${SEED_DOWNLOAD_TIMEOUT:-20}"

# Bucket name lives in the manifest under "bucket": "...".
BUCKET=$(
  grep -E '^[[:space:]]*"bucket"' /seed-manifest.json \
  | head -n 1 \
  | sed -E 's/.*"bucket"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/'
)
BUCKET="${BUCKET:-aether-images}"

echo "[seed] waiting for MinIO at ${MINIO_HOST}:${MINIO_PORT} ..."
until mc alias set "${MINIO_ALIAS}" "http://${MINIO_HOST}:${MINIO_PORT}" "${MINIO_USER}" "${MINIO_PASS}" >/dev/null 2>&1; do
  sleep 1
done
echo "[seed] MinIO is up; alias '${MINIO_ALIAS}' configured."

if ! mc ls "${MINIO_ALIAS}/${BUCKET}" >/dev/null 2>&1; then
  echo "[seed] creating bucket '${BUCKET}' ..."
  mc mb "${MINIO_ALIAS}/${BUCKET}"
else
  echo "[seed] bucket '${BUCKET}' already exists."
fi

# Allow anonymous downloads – the SSR frontend hot-links the objects.
mc anonymous set download "${MINIO_ALIAS}/${BUCKET}" >/dev/null || true

# -----------------------------------------------------------------------------
# Extract "key": "url" pairs from the manifest.
# Lines look like:    "merchandise/foo": "https://...."
#                or   "vehicles/wheels/aero-blade.png": ""    (local-only asset)
# We accept any quoted value (including empty) so locally-bundled assets are
# enumerated too, and filter out the bucket name + any comment-style keys
# (anything that starts with an underscore).
# -----------------------------------------------------------------------------
echo "[seed] scanning manifest for missing assets ..."

grep -E '^[[:space:]]*"[^"]+"[[:space:]]*:[[:space:]]*"[^"]*"' /seed-manifest.json \
  | grep -v '"bucket"' \
  | grep -v '"_' \
  | sed -E 's/^[[:space:]]*"([^"]+)"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1|\2/' \
  > /tmp/manifest.tsv

count_total=0
count_uploaded_local=0
count_uploaded_url=0
count_skipped=0
count_failed=0

while IFS='|' read -r key url; do
  [ -z "$key" ] && continue
  count_total=$((count_total + 1))

  # Keys with an explicit extension keep it (e.g. "vehicles/wheels/aero.png"
  # for transparent PNG overlays); otherwise default to .jpg.
  case "${key}" in
    *.png|*.jpg|*.jpeg|*.webp|*.svg|*.gif)
      object="${key}"
      ;;
    *)
      object="${key}.jpg"
      ;;
  esac

  if mc stat "${MINIO_ALIAS}/${BUCKET}/${object}" >/dev/null 2>&1; then
    echo "[seed]   skip  ${object} (already in bucket)"
    count_skipped=$((count_skipped + 1))
    continue
  fi

  # ---- Prefer locally bundled file -----------------------------------------
  local_file="${LOCAL_SEED_DIR}/${object}"
  if [ -f "${local_file}" ] && [ -s "${local_file}" ]; then
    echo "[seed]   local ${object}  (from ${local_file})"
    mc cp --quiet "${local_file}" "${MINIO_ALIAS}/${BUCKET}/${object}" >/dev/null
    count_uploaded_local=$((count_uploaded_local + 1))
    continue
  fi

  # ---- Fall back to URL download (if a URL was supplied) -------------------
  if [ -z "${url}" ]; then
    echo "[seed]   WARN  ${object} not available (no local file, no URL in manifest)"
    count_failed=$((count_failed + 1))
    continue
  fi

  tmp="/tmp/$(echo "$key" | tr '/' '_')"
  echo "[seed]   fetch ${object}  (no local file → trying URL)"
  if wget -q --timeout="${DOWNLOAD_TIMEOUT}" -O "${tmp}" "${url}" && [ -s "${tmp}" ]; then
    mc cp --quiet "${tmp}" "${MINIO_ALIAS}/${BUCKET}/${object}" >/dev/null
    count_uploaded_url=$((count_uploaded_url + 1))
  else
    echo "[seed]   WARN  ${object} not available (no local file, URL unreachable)"
    count_failed=$((count_failed + 1))
  fi
  rm -f "${tmp}"
done < /tmp/manifest.tsv

echo "[seed] done."
echo "[seed]   total=${count_total}"
echo "[seed]   uploaded from local files: ${count_uploaded_local}"
echo "[seed]   uploaded from URLs:        ${count_uploaded_url}"
echo "[seed]   already present:           ${count_skipped}"
echo "[seed]   failed:                    ${count_failed}"

if [ "${count_failed}" -gt 0 ]; then
  echo ""
  echo "[seed] Tip: drop missing images into ./infrastructure/minio/seed-images/"
  echo "[seed]      (see that folder's README.md for the expected filenames),"
  echo "[seed]      then re-run \`docker compose up\`."
fi
