const express = require('express');

const app = express();
const PORT = process.env.PORT || 3003;

// TODO: Replace in-memory store with MySQL database
const orders = {};

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

// Get orders for a specific user
app.get('/orders/:userId', (req, res) => {
  const { userId } = req.params;
  const userOrders = orders[userId] || [];
  res.json({ userId, orders: userOrders });
});

// Create a new order
app.post('/orders', (req, res) => {
  const { userId, items, total } = req.body;

  if (!userId || !items || total === undefined) {
    return res.status(400).json({ error: 'Missing required fields: userId, items, total' });
  }

  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  const newOrder = {
    id: orderId,
    userId,
    items,
    total,
    timestamp
  };

  if (!orders[userId]) {
    orders[userId] = [];
  }

  orders[userId].push(newOrder);

  res.status(201).json(newOrder);
});

// Start server
app.listen(PORT, () => {
  console.log(`Order service listening on port ${PORT}`);
});
