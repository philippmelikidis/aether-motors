const express = require('express');
const { createCart, getCartById, saveCart } = require('./data/store');
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

function getRequiredCart(cartId) {
  return getCartById(cartId);
}

app.get('/health', (req, res) => {
  success(res, { service: 'cart-service', healthy: true });
});

app.post('/api/cart', (req, res) => {
  const cart = createCart(buildEmptyCart(nextId('cart')));
  success(res, buildCartResponse(cart), 201);
});

app.get('/api/cart/:cartId', (req, res) => {
  const cart = getRequiredCart(req.params.cartId);
  if (!cart) {
    return error(res, 'Cart not found', 404);
  }

  success(res, buildCartResponse(cart));
});

app.get('/api/cart/:cartId/items', (req, res) => {
  const cart = getRequiredCart(req.params.cartId);
  if (!cart) {
    return error(res, 'Cart not found', 404);
  }

  success(res, cart.items);
});

app.get('/api/cart/:cartId/summary', (req, res) => {
  const cart = getRequiredCart(req.params.cartId);
  if (!cart) {
    return error(res, 'Cart not found', 404);
  }

  success(res, calculateSummary(cart));
});

app.post('/api/cart/:cartId/items', async (req, res) => {
  const cart = getRequiredCart(req.params.cartId);
  if (!cart) {
    return error(res, 'Cart not found', 404);
  }

  const { productId, quantity, configuration } = req.body || {};

  if (!productId) {
    return error(res, 'productId is required', 400);
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return error(res, 'quantity must be a positive integer', 400);
  }

  const product = await getProductById(productId);
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
    existingItem.lineTotal = Number((existingItem.quantity * existingItem.price).toFixed(2));
    saveCart(cart);
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
  saveCart(cart);
  success(res, item, 201);
});

app.patch('/api/cart/:cartId/items/:itemId', (req, res) => {
  const cart = getRequiredCart(req.params.cartId);
  if (!cart) {
    return error(res, 'Cart not found', 404);
  }

  const item = cart.items.find((entry) => entry.id === req.params.itemId);
  if (!item) {
    return error(res, 'Cart item not found', 404);
  }

  const { quantity } = req.body || {};
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return error(res, 'quantity must be a positive integer', 400);
  }

  item.quantity = quantity;
  item.lineTotal = Number((item.price * item.quantity).toFixed(2));
  saveCart(cart);

  success(res, clone(item));
});

app.delete('/api/cart/:cartId/items/:itemId', (req, res) => {
  const cart = getRequiredCart(req.params.cartId);
  if (!cart) {
    return error(res, 'Cart not found', 404);
  }

  const before = cart.items.length;
  cart.items = cart.items.filter((entry) => entry.id !== req.params.itemId);

  if (cart.items.length === before) {
    return error(res, 'Cart item not found', 404);
  }

  saveCart(cart);
  success(res, buildCartResponse(cart));
});

app.delete('/api/cart/:cartId', (req, res) => {
  const cart = getRequiredCart(req.params.cartId);
  if (!cart) {
    return error(res, 'Cart not found', 404);
  }

  cart.items = [];
  saveCart(cart);
  success(res, buildCartResponse(cart));
});

app.use((req, res) => {
  error(res, 'Route not found', 404);
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`cart-service listening on port ${port}`);
});
