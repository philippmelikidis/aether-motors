const express = require('express');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// TODO: Replace with Redis store
const cartStore = {};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cart-service' });
});

// Get cart for user
app.get('/cart/:userId', (req, res) => {
  const { userId } = req.params;
  const cart = cartStore[userId] || { userId, items: [] };
  res.json(cart);
});

// Add item to cart
app.post('/cart/:userId/items', (req, res) => {
  const { userId } = req.params;
  const item = req.body;

  if (!cartStore[userId]) {
    cartStore[userId] = { userId, items: [] };
  }

  cartStore[userId].items.push(item);
  res.json(cartStore[userId]);
});

// Clear cart
app.delete('/cart/:userId', (req, res) => {
  const { userId } = req.params;
  delete cartStore[userId];
  res.json({ message: 'Cart cleared', userId });
});

app.listen(PORT, () => {
  console.log(`Cart service listening on port ${PORT}`);
});
