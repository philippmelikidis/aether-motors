const express = require('express');
const { createOrder, getOrderById, getAllOrders, saveOrder, deleteOrder } = require('./data/store');
const { success, error } = require('./utils/response');
const { nextOrderId } = require('./utils/id');
const { getCart } = require('./clients/cartClient');

const app = express();
app.use(express.json());

const ALLOWED_STATUS = new Set(['created', 'paid', 'cancelled']);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeCheckout(body) {
  return body.checkout || body.validatedCheckoutData || null;
}

function isValidAddress(address) {
  if (!address || typeof address !== 'object') {
    return false;
  }

  return ['street', 'zip', 'city', 'country'].every((field) => Boolean(address[field]));
}

app.get('/health', (req, res) => {
  success(res, { service: 'order-service', healthy: true });
});

app.get('/api/orders', (req, res) => {
  success(res, getAllOrders());
});

app.post('/api/orders', async (req, res) => {
  const { cartId } = req.body || {};
  const checkout = normalizeCheckout(req.body || {});

  if (!cartId) {
    return error(res, 'cartId is required', 400);
  }

  if (!checkout) {
    return error(res, 'validated checkout data is required', 400);
  }

  if (!isValidAddress(checkout.address)) {
    return error(res, 'checkout.address must contain street, zip, city and country', 400);
  }

  const cart = await getCart(cartId);
  if (!cart) {
    return error(res, 'Referenced cart not found', 404);
  }

  if (!Array.isArray(cart.items) || cart.items.length === 0) {
    return error(res, 'Cart is empty', 409);
  }

  const now = new Date().toISOString();
  const order = {
    id: nextOrderId(),
    status: 'created',
    createdAt: now,
    updatedAt: now,
    cartReference: cart.id,
    customer: clone(checkout.customer || {}),
    address: clone(checkout.address),
    items: clone(cart.items),
    totals: clone(cart.summary || {}),
  };

  createOrder(order);
  success(res, order, 201);
});

app.get('/api/orders/:orderId', (req, res) => {
  const order = getOrderById(req.params.orderId);
  if (!order) {
    return error(res, 'Order not found', 404);
  }

  success(res, order);
});

app.get('/api/orders/:orderId/status', (req, res) => {
  const order = getOrderById(req.params.orderId);
  if (!order) {
    return error(res, 'Order not found', 404);
  }

  success(res, {
    orderId: order.id,
    status: order.status,
  });
});

app.patch('/api/orders/:orderId/status', (req, res) => {
  const order = getOrderById(req.params.orderId);
  if (!order) {
    return error(res, 'Order not found', 404);
  }

  const nextStatus = req.body?.status;
  if (!ALLOWED_STATUS.has(nextStatus)) {
    return error(res, 'status must be one of: created, paid, cancelled', 400);
  }

  order.status = nextStatus;
  saveOrder(order);
  success(res, order);
});

app.put('/api/orders/:orderId/address', (req, res) => {
  const order = getOrderById(req.params.orderId);
  if (!order) {
    return error(res, 'Order not found', 404);
  }

  if (!isValidAddress(req.body || {})) {
    return error(res, 'address must contain street, zip, city and country', 400);
  }

  order.address = clone(req.body);
  saveOrder(order);
  success(res, order);
});

app.delete('/api/orders/:orderId', (req, res) => {
  const deleted = deleteOrder(req.params.orderId);
  if (!deleted) {
    return error(res, 'Order not found', 404);
  }

  success(res, {
    orderId: req.params.orderId,
    deleted: true,
  });
});

app.use((req, res) => {
  error(res, 'Route not found', 404);
});

const port = Number(process.env.PORT || 3002);
app.listen(port, () => {
  console.log(`order-service listening on port ${port}`);
});
