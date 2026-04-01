const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// ---------------------------------------------------------------------------
// Product catalogue (must match frontend/src/data/merchandise.ts)
// ---------------------------------------------------------------------------
const PRODUCTS = {
  'zenith-shell-v1':   { name: 'ZENITH SHELL V.1',    price: 450 },
  'chronos-ti-link':   { name: 'CHRONOS TI-LINK',     price: 1200 },
  'velocity-01-shoe':  { name: 'VELOCITY 01 SHOE',    price: 280 },
  'zenith-diecast-1-18': { name: '1:18 ZENITH DIECAST', price: 550 },
  'schematic-tee':     { name: 'SCHEMATIC TEE',        price: 85 },
};

// ---------------------------------------------------------------------------
// In-memory cart store  (TODO: swap for Redis)
// ---------------------------------------------------------------------------
const carts = {};

function buildSummary(items) {
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  return { itemCount, subtotal, totalPrice: subtotal };
}

function cartResponse(cart) {
  return {
    data: {
      id: cart.id,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items: cart.items,
      summary: buildSummary(cart.items),
    },
  };
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cart-service' });
});

// ---------------------------------------------------------------------------
// POST /api/cart — create a new cart
// ---------------------------------------------------------------------------
app.post('/api/cart', (_req, res) => {
  const id = `cart_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  carts[id] = { id, createdAt: now, updatedAt: now, items: [] };
  res.status(201).json(cartResponse(carts[id]));
});

// ---------------------------------------------------------------------------
// GET /api/cart/:cartId — fetch cart
// ---------------------------------------------------------------------------
app.get('/api/cart/:cartId', (req, res) => {
  const cart = carts[req.params.cartId];
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Cart not found' });
  }
  res.json(cartResponse(cart));
});

// ---------------------------------------------------------------------------
// POST /api/cart/:cartId/items — add item { productId, quantity, configuration? }
// ---------------------------------------------------------------------------
app.post('/api/cart/:cartId/items', (req, res) => {
  const cart = carts[req.params.cartId];
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Cart not found' });
  }

  const { productId, quantity = 1, configuration = {} } = req.body;
  const product = PRODUCTS[productId];
  if (!product) {
    return res.status(422).json({ status: 'error', message: 'Product not found' });
  }

  // If the same product already exists, increase quantity
  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
    existing.lineTotal = existing.price * existing.quantity;
  } else {
    cart.items.push({
      id: `item_${crypto.randomUUID().slice(0, 8)}`,
      productId,
      name: product.name,
      price: product.price,
      quantity,
      configuration,
      lineTotal: product.price * quantity,
    });
  }

  cart.updatedAt = new Date().toISOString();
  const item = existing || cart.items[cart.items.length - 1];
  res.status(201).json({ data: item });
});

// ---------------------------------------------------------------------------
// PATCH /api/cart/:cartId/items/:itemId — update quantity
// ---------------------------------------------------------------------------
app.patch('/api/cart/:cartId/items/:itemId', (req, res) => {
  const cart = carts[req.params.cartId];
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Cart not found' });
  }

  const item = cart.items.find((i) => i.id === req.params.itemId);
  if (!item) {
    return res.status(404).json({ status: 'error', message: 'Item not found' });
  }

  item.quantity = req.body.quantity ?? item.quantity;
  item.lineTotal = item.price * item.quantity;
  cart.updatedAt = new Date().toISOString();
  res.json({ data: item });
});

// ---------------------------------------------------------------------------
// DELETE /api/cart/:cartId/items/:itemId — remove item
// ---------------------------------------------------------------------------
app.delete('/api/cart/:cartId/items/:itemId', (req, res) => {
  const cart = carts[req.params.cartId];
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Cart not found' });
  }

  cart.items = cart.items.filter((i) => i.id !== req.params.itemId);
  cart.updatedAt = new Date().toISOString();
  res.json(cartResponse(cart));
});

// ---------------------------------------------------------------------------
// DELETE /api/cart/:cartId — clear cart
// ---------------------------------------------------------------------------
app.delete('/api/cart/:cartId', (req, res) => {
  const cart = carts[req.params.cartId];
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Cart not found' });
  }

  cart.items = [];
  cart.updatedAt = new Date().toISOString();
  res.json(cartResponse(cart));
});

// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Cart service listening on port ${PORT}`);
});
