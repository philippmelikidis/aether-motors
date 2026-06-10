const path = require('path');
const express = require('express');
const configurationsRoutes = require('./routes/configurations.routes');
const { renderConfiguratorPage } = require('./controllers/page.controller');

const app = express();

// EJS view engine — used for the embeddable HTML page.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.json());

// Static assets (compiled Tailwind + iframe-side JS).
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health
app.get('/health', (req, res) => {
  res.json({ service: 'configurator-service', status: 'ok' });
});

// JSON API (kept for server-to-server use cases; the iframe itself does
// NOT hit /api/configurations/build — it gets the resolved configuration
// rendered straight into the EJS template).
app.use('/api/configurations', configurationsRoutes);

// Embeddable configurator HTML page. Mounted at "/" so the iframe-src
// can be either the bare service URL (http://configurator-service:3008/)
// or the SSR backend's proxy path (/configurator-ui/).
app.get('/', renderConfiguratorPage);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'not_found' });
});

// Error fallback
app.use((err, req, res, next) => {
  console.error('[configurator-service] unhandled error:', err);
  res.status(500).json({ success: false, error: 'internal_error' });
});

module.exports = app;
