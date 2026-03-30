const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SSR routes
app.get('/', async (req, res) => {
  try {
    res.render('index', { title: 'Aether Motors' });
  } catch (err) {
    console.error('Error rendering index:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'web-shop-backend', timestamp: new Date().toISOString() });
});

// Proxy helper
async function proxyRequest(req, res, targetBaseUrl) {
  const targetUrl = `${targetBaseUrl}${req.path}`;
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      params: req.query,
      data: req.body,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      console.error(`Proxy error to ${targetUrl}:`, err.message);
      res.status(502).json({ error: 'Bad Gateway', message: err.message });
    }
  }
}

// Proxy routes
app.all('/api/products*', (req, res) => {
  proxyRequest(req, res, PRODUCT_SERVICE_URL);
});

app.all('/api/cart*', (req, res) => {
  proxyRequest(req, res, CART_SERVICE_URL);
});

app.all('/api/orders*', (req, res) => {
  proxyRequest(req, res, ORDER_SERVICE_URL);
});

app.listen(PORT, () => {
  console.log(`web-shop-backend running on port ${PORT}`);
  console.log(`  PRODUCT_SERVICE_URL: ${PRODUCT_SERVICE_URL}`);
  console.log(`  CART_SERVICE_URL:    ${CART_SERVICE_URL}`);
  console.log(`  ORDER_SERVICE_URL:   ${ORDER_SERVICE_URL}`);
});
