// ---------------------------------------------------------------------------
// Cart Service – HTTP layer.
//
// All persistence is delegated to ./data/store, which is now backed by Redis
// (see ADR8 in the architecture documentation). Every handler that touches a
// cart awaits the asynchronous store API – DO NOT switch back to the previous
// synchronous Map-based implementation.
// ---------------------------------------------------------------------------

const express = require('express');
const {
  createCart,
  getCartById,
  saveCart,
  deleteCart,
  ping,
  shutdown,
} = require('./data/store');
const { success, error } = require('./utils/response');
const { nextId } = require('./utils/id');
const { getProductById } = require('./clients/productClient');

const app = express();
app.use(express.json());

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeConfiguration(configuration) {
  return configuration && typeof configuration === 'object' ? configuration : {};
}

function calculateSummary(cart) {
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(
    cart.items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );

  return {
    itemCount,
    subtotal,
    totalPrice: subtotal,
  };
}

function buildCartResponse(cart) {
  return {
    id: cart.id,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
    items: cart.items,
    summary: calculateSummary(cart),
  };
}

function buildEmptyCart(cartId) {
  const now = new Date().toISOString();
  return {
    id: cartId,
    createdAt: now,
    updatedAt: now,
    items: [],
  };
}

app.get('/health', async (_req, res) => {
  try {
    await ping();
    success(res, { service: 'cart-service', healthy: true, redis: 'up' });
  } catch (err) {
    res
      .status(503)
      .json({ service: 'cart-service', healthy: false, redis: 'down', error: err.message });
  }
});

app.post('/api/cart', async (_req, res) => {
  try {
    const cart = await createCart(buildEmptyCart(nextId('cart')));
    success(res, buildCartResponse(cart), 201);
  } catch (err) {
    error(res, `Could not create cart: ${err.message}`, 503);
  }
});

app.get('/api/cart/:cartId', async (req, res) => {
  try {
    const cart = await getCartById(req.params.cartId);
    if (!cart) return error(res, 'Cart not found', 404);
    success(res, buildCartResponse(cart));
  } catch (err) {
    error(res, `Could not load cart: ${err.message}`, 503);
  }
});

app.get('/api/cart/:cartId/items', async (req, res) => {
  try {
    const cart = await getCartById(req.params.cartId);
    if (!cart) return error(res, 'Cart not found', 404);
    success(res, cart.items);
  } catch (err) {
    error(res, `Could not load cart: ${err.message}`, 503);
  }
});

app.get('/api/cart/:cartId/summary', async (req, res) => {
  try {
    const cart = await getCartById(req.params.cartId);
    if (!cart) return error(res, 'Cart not found', 404);
    success(res, calculateSummary(cart));
  } catch (err) {
    error(res, `Could not load cart: ${err.message}`, 503);
  }
});

app.post('/api/cart/:cartId/items', async (req, res) => {
  let cart;
  try {
    cart = await getCartById(req.params.cartId);
  } catch (err) {
    return error(res, `Could not load cart: ${err.message}`, 503);
  }
  if (!cart) return error(res, 'Cart not found', 404);

  const { productId, quantity, configuration } = req.body || {};

  if (!productId) {
    return error(res, 'productId is required', 400);
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return error(res, 'quantity must be a positive integer', 400);
  }

  let product;
  try {
    product = await getProductById(productId);
  } catch (err) {
    return error(res, `Product lookup failed: ${err.message}`, 503);
  }
  if (!product) {
    return error(res, 'Product not found', 404);
  }

  if (!product.available) {
    return error(res, 'Product is not available', 409);
  }

  const normalizedConfiguration = normalizeConfiguration(configuration);
  const existingItem = cart.items.find(
    (item) =>
      item.productId === product.id &&
      JSON.stringify(item.configuration) === JSON.stringify(normalizedConfiguration)
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.lineTotal = Number(
      (existingItem.quantity * existingItem.price).toFixed(2)
    );
    await saveCart(cart);
    return success(res, existingItem, 201);
  }

  const item = {
    id: nextId('item'),
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    available: Boolean(product.available),
    quantity,
    configuration: normalizedConfiguration,
    lineTotal: Number((product.price * quantity).toFixed(2)),
  };

  cart.items.push(item);
  await saveCart(cart);
  success(res, item, 201);
});

app.patch('/api/cart/:cartId/items/:itemId', async (req, res) => {
  let cart;
  try {
    cart = await getCartById(req.params.cartId);
  } catch (err) {
    return error(res, `Could not load cart: ${err.message}`, 503);
  }
  if (!cart) return error(res, 'Cart not found', 404);

  const item = cart.items.find((entry) => entry.id === req.params.itemId);
  if (!item) return error(res, 'Cart item not found', 404);

  const { quantity } = req.body || {};
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return error(res, 'quantity must be a positive integer', 400);
  }

  item.quantity = quantity;
  item.lineTotal = Number((item.price * item.quantity).toFixed(2));
  await saveCart(cart);

  success(res, clone(item));
});

app.delete('/api/cart/:cartId/items/:itemId', async (req, res) => {
  const cart = await getCartById(req.params.cartId);
  if (!cart) return error(res, 'Cart not found', 404);

  const before = cart.items.length;
  cart.items = cart.items.filter((entry) => entry.id !== req.params.itemId);

  if (cart.items.length === before) {
    return error(res, 'Cart item not found', 404);
  }

  await saveCart(cart);
  success(res, buildCartResponse(cart));
});

app.delete('/api/cart/:cartId', async (req, res) => {
  try {
    const cart = await getCartById(req.params.cartId);
    if (!cart) return error(res, 'Cart not found', 404);

    await deleteCart(cart.id);
    success(res, { id: cart.id, deleted: true });
  } catch (err) {
    error(res, `Could not delete cart: ${err.message}`, 503);
  }
});

app.use((_req, res) => {
  error(res, 'Route not found', 404);
});

const port = Number(process.env.PORT || 3002);
const server = app.listen(port, () => {
  console.log(`cart-service listening on port ${port}`);
});

// Clean shutdown so Redis connections aren't left dangling in containers
// that receive SIGTERM during a redeploy.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    console.log(`[cart-service] received ${signal}, shutting down`);
    server.close();
    await shutdown();
    process.exit(0);
  });
}
