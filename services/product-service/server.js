const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

// Sample vehicle data
const products = [
  {
    id: 1,
    name: "Aether GT-X",
    price: 89999,
    category: "performance"
  },
  {
    id: 2,
    name: "Aether Urban Pro",
    price: 45999,
    category: "urban"
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "product-service" });
});

// Get all products
app.get('/products', (req, res) => {
  res.json(products);
});

// Get product by id
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Product service running on port ${PORT}`);
});
