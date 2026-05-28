// ---------------------------------------------------------------------------
// Aether Motors – Media Service
//
// Thin REST facade over the project's MinIO instance. The service exposes:
//   GET /health           – liveness probe
//   GET /media            – list every object currently stored in the bucket
//   GET /media/:id        – return a single object's metadata (id == object
//                            key with slashes replaced by `--`)
//
// The service never proxies the bytes themselves — the SSR frontend talks
// directly to MinIO on port 9000 for hot-linked images. This keeps the
// Media Service responsibility focused on catalog metadata.
// ---------------------------------------------------------------------------

const express = require('express');
const { Client: MinioClient } = require('minio');

const app = express();
const PORT = Number(process.env.PORT || 3004);

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'minio';
const MINIO_PORT = Number(process.env.MINIO_PORT || 9000);
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'aether_admin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'aether_secret_change_me';
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'aether-images';
const MINIO_PUBLIC_URL =
  process.env.MINIO_PUBLIC_URL || `http://localhost:${MINIO_PORT}`;

const minio = new MinioClient({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: false,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

app.use(express.json());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const VIDEO_EXT = new Set(['.mp4', '.mov', '.webm']);
const ASSET_3D_EXT = new Set(['.glb', '.gltf', '.usdz']);

function classify(objectName) {
  const lower = objectName.toLowerCase();
  const ext = lower.slice(lower.lastIndexOf('.'));
  if (VIDEO_EXT.has(ext)) return 'video';
  if (ASSET_3D_EXT.has(ext)) return '3d-asset';
  return 'image';
}

/** Turn `gallery/the-cockpit.jpg` into the URL-safe id `gallery--the-cockpit.jpg`. */
function objectToId(objectName) {
  return objectName.replace(/\//g, '--');
}

function idToObject(id) {
  return id.replace(/--/g, '/');
}

function toMediaRecord(stat) {
  return {
    id: objectToId(stat.name),
    object: stat.name,
    type: classify(stat.name),
    url: `${MINIO_PUBLIC_URL.replace(/\/+$/, '')}/${MINIO_BUCKET}/${stat.name}`,
    sizeBytes: stat.size,
    lastModified: stat.lastModified,
  };
}

function listAllObjects() {
  return new Promise((resolve, reject) => {
    const out = [];
    const stream = minio.listObjectsV2(MINIO_BUCKET, '', true);
    stream.on('data', (obj) => out.push(obj));
    stream.on('end', () => resolve(out));
    stream.on('error', (err) => reject(err));
  });
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------
app.get('/health', async (_req, res) => {
  try {
    const exists = await minio.bucketExists(MINIO_BUCKET);
    if (!exists) {
      return res.status(503).json({
        status: 'degraded',
        service: 'media-service',
        bucket: MINIO_BUCKET,
        error: 'Bucket not found',
      });
    }
    res.json({ status: 'healthy', service: 'media-service', bucket: MINIO_BUCKET });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      service: 'media-service',
      error: err.message,
    });
  }
});

app.get('/media', async (_req, res) => {
  try {
    const items = await listAllObjects();
    res.json(items.map(toMediaRecord));
  } catch (err) {
    res.status(503).json({ error: 'Catalog unavailable', details: err.message });
  }
});

app.get('/media/:id', async (req, res) => {
  const objectName = idToObject(req.params.id);
  try {
    const stat = await minio.statObject(MINIO_BUCKET, objectName);
    res.json(
      toMediaRecord({
        name: objectName,
        size: stat.size,
        lastModified: stat.lastModified,
      })
    );
  } catch (err) {
    if (err.code === 'NotFound' || err.code === 'NoSuchKey') {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.status(503).json({ error: 'Catalog unavailable', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(
    `Media service listening on port ${PORT} (bucket=${MINIO_BUCKET}, minio=${MINIO_ENDPOINT}:${MINIO_PORT})`
  );
});
