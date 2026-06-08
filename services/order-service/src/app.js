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

app.get('/api/orders', async (req, res) => {
  try {
    success(res, await getAllOrders());
  } catch (err) {
    error(res, 'Failed to fetch orders', 500);
  }
});

app.post('/api/orders', async (req, res) => {
  const body = req.body || {};
  const { cartId, type } = body;
  const checkout = normalizeCheckout(body);

  // Optional cart lookup when a cartId is supplied. Backend may post either
  //   - vehicle config orders (no cartId)
  //   - merchandise cart checkouts (cartId set, no checkout block)
  //   - rich checkouts that include validated checkout/address data
  let cart = null;
  if (cartId) {
    try {
      cart = await getCart(cartId);
    } catch (err) {
      cart = null;
    }
  }

  // If a checkout block IS supplied, validate its address (preserves the
  // stricter contract for callers that opt in).
  if (checkout && !isValidAddress(checkout.address)) {
    return error(res, 'checkout.address must contain street, zip, city and country', 400);
  }

  const items = Array.isArray(body.items)
    ? body.items
    : (cart && Array.isArray(cart.items) ? cart.items : []);

  const totals = body.totals || (cart && cart.summary) || {
    subtotal: body.subtotal,
    shipping: body.shipping,
    total: body.total,
    currency: body.currency,
  };

  const now = new Date().toISOString();
  const order = {
    id: nextOrderId(),
    orderId: undefined, // filled below for backwards-compat
    status: 'created',
    createdAt: now,
    updatedAt: now,
    type: type || (cartId ? 'merchandise' : 'vehicle'),
    cartReference: cart ? cart.id : (cartId || null),
    vehicleId: body.vehicleId || null,
    vehicleName: body.vehicleName || null,
    config: body.config ? clone(body.config) : null,
    customer: checkout ? clone(checkout.customer || {}) : {},
    address: checkout ? clone(checkout.address) : null,
    items: clone(items),
    totals: clone(totals),
  };
  order.orderId = order.id;

  try {
    await createOrder(order);
    success(res, order, 201);
  } catch (err) {
    error(res, 'Failed to create order', 500);
  }
});

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) {
      return error(res, 'Order not found', 404);
    }
    success(res, order);
  } catch (err) {
    error(res, 'Failed to fetch order', 500);
  }
});

app.get('/api/orders/:orderId/status', async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) {
      return error(res, 'Order not found', 404);
    }
    success(res, {
      orderId: order.id,
      status: order.status,
    });
  } catch (err) {
    error(res, 'Failed to fetch order status', 500);
  }
});

app.patch('/api/orders/:orderId/status', async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) {
      return error(res, 'Order not found', 404);
    }

    const nextStatus = req.body?.status;
    if (!ALLOWED_STATUS.has(nextStatus)) {
      return error(res, 'status must be one of: created, paid, cancelled', 400);
    }

    order.status = nextStatus;
    await saveOrder(order);
    success(res, order);
  } catch (err) {
    error(res, 'Failed to update order status', 500);
  }
});

app.put('/api/orders/:orderId/address', async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) {
      return error(res, 'Order not found', 404);
    }

    if (!isValidAddress(req.body || {})) {
      return error(res, 'address must contain street, zip, city and country', 400);
    }

    order.address = clone(req.body);
    await saveOrder(order);
    success(res, order);
  } catch (err) {
    error(res, 'Failed to update order address', 500);
  }
});

app.delete('/api/orders/:orderId', async (req, res) => {
  try {
    const deleted = await deleteOrder(req.params.orderId);
    if (!deleted) {
      return error(res, 'Order not found', 404);
    }
    success(res, {
      orderId: req.params.orderId,
      deleted: true,
    });
  } catch (err) {
    error(res, 'Failed to delete order', 500);
  }
});

app.use((req, res) => {
  error(res, 'Route not found', 404);
});

const port = Number(process.env.PORT || 3003);
app.listen(port, () => {
  console.log(`order-service listening on port ${port}`);
});
