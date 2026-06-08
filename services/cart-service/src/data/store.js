// ---------------------------------------------------------------------------
// Cart Service – persistence layer.
//
// Carts are stored in Redis as JSON strings under the key
//   <REDIS_KEY_PREFIX>:<cartId>
// with a sliding TTL applied on every write so abandoned carts disappear after
// REDIS_TTL_SECONDS of inactivity.
//
// The Redis client uses an offline queue and `lazyConnect: false` so the very
// first incoming request is automatically buffered until the connection is
// established. If Redis is unreachable on startup the queries simply return
// `null` / throw – this is intentional, the service exposes its degraded
// state through the /health endpoint.
// ---------------------------------------------------------------------------

const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const KEY_PREFIX = process.env.REDIS_KEY_PREFIX || 'aether:cart';
const TTL_SECONDS = Number(process.env.REDIS_TTL_SECONDS || 86400);

const redis = new Redis(REDIS_URL, {
  // Retry forever with exponential backoff capped at 2 s.
  retryStrategy(times) {
    return Math.min(2000, 50 * Math.pow(2, Math.min(times, 8)));
  },
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
});

redis.on('connect', () => {
  console.log(`[store] connected to Redis at ${REDIS_URL}`);
});
redis.on('error', (err) => {
  console.warn('[store] Redis error:', err.message);
});

function keyFor(cartId) {
  return `${KEY_PREFIX}:${cartId}`;
}

async function createCart(cart) {
  await redis.set(keyFor(cart.id), JSON.stringify(cart), 'EX', TTL_SECONDS);
  return cart;
}

async function getCartById(cartId) {
  const raw = await redis.get(keyFor(cartId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[store] invalid JSON for cart ${cartId}:`, err.message);
    return null;
  }
}

async function saveCart(cart) {
  cart.updatedAt = new Date().toISOString();
  await redis.set(keyFor(cart.id), JSON.stringify(cart), 'EX', TTL_SECONDS);
  return cart;
}

async function deleteCart(cartId) {
  return redis.del(keyFor(cartId));
}

/** Used by /health to expose the backing-store state. */
async function ping() {
  return redis.ping();
}

async function shutdown() {
  try {
    await redis.quit();
  } catch (_) {
    // already closed
  }
}

module.exports = {
  createCart,
  getCartById,
  saveCart,
  deleteCart,
  ping,
  shutdown,
};
