const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const path = require('path');

const { defaultVehicle } = require('./data/vehicles');
const { galleryItems } = require('./data/gallery');
const { products, categories } = require('./data/merchandise');
const { routeEvent, countdown, telemetry, waypoints, mapImage } = require('./data/route');
const { navLinks, navCards } = require('./src/config/navigation');

const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
const CART_COOKIE = 'aether_cart_id';
const CART_COOKIE_OPTS = { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 30 };

const app = express();
const PORT = process.env.PORT || 3000;

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3006';
const ROADMAP_SERVICE_URL = process.env.ROADMAP_SERVICE_URL || 'http://localhost:3007';

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function unwrap(payload) {
  return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
}

async function fetchRoadmapData() {
  // Use a generous timeout — the roadmap service may do an external OSRM
  // lookup on first hit. Falling back too quickly leaves users staring at
  // the "Roadmap Offline" placeholder.
  const response = await axios.get(`${ROADMAP_SERVICE_URL}/api/roadmap`, { timeout: 12000 });
  return response.data;
}

async function fetchCart(cartId) {
  if (!cartId) return null;
  try {
    const res = await axios.get(`${CART_SERVICE_URL}/api/cart/${cartId}`, { timeout: 3000 });
    return unwrap(res.data);
  } catch (err) {
    if (err.response && err.response.status === 404) return null;
    console.warn(`[cart] fetch ${cartId} failed:`, err.message);
    return null;
  }
}

async function ensureCart(req, res) {
  let cart = await fetchCart(req.cookies[CART_COOKIE]);
  if (cart) return cart;
  try {
    const created = await axios.post(`${CART_SERVICE_URL}/api/cart`, {}, { timeout: 3000 });
    cart = unwrap(created.data);
    if (cart && cart.id) {
      res.cookie(CART_COOKIE, cart.id, CART_COOKIE_OPTS);
    }
    return cart;
  } catch (err) {
    console.warn('[cart] create failed:', err.message);
    return null;
  }
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout.ejs');
app.use(expressLayouts);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  const isPage =
    req.method === 'GET' &&
    !req.path.startsWith('/api/') &&
    !req.path.startsWith('/css/') &&
    !req.path.startsWith('/js/');
  if (isPage) {
    const cart = await fetchCart(req.cookies[CART_COOKIE]);
    res.locals.cartCount = cart && cart.summary ? cart.summary.itemCount : 0;
  } else {
    res.locals.cartCount = 0;
  }
  next();
});

app.use((req, res, next) => {
  res.locals.navCards = navCards;
  res.locals.navLinks = navLinks;
  next();
});
// ── API gateway routes ───────────────────────────────────────────────
app.get('/api/ai/options', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/ai/options`, { timeout: 4000 });
    res.json(unwrap(response.data));
  } catch (err) {
    res.status(502).json({ error: 'AI service unavailable', details: err.message });
  }
});

app.post('/api/ai/configure', async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/ai/configure`, req.body, {
      timeout: 10000,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response ? err.response.status : 502;
    res.status(status).json({
      error: 'AI service unavailable',
      details: err.message,
      data: err.response ? err.response.data : undefined,
    });
  }
});

app.all('/api/roadmap*', (req, res) => proxyRequest(req, res, ROADMAP_SERVICE_URL));
app.all('/api/presentation*', (req, res) => proxyRequest(req, res, ROADMAP_SERVICE_URL));
// ── SSR routes ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.render('pages/home', {
    title: 'Home',
    active: '',
    vehicle: defaultVehicle,
    navCards,
    formatPrice,
  });
});

app.get('/configurator', (req, res) => {
  const vehicle = defaultVehicle;
  const selectedColor =
    vehicle.colors.find((c) => c.id === req.query.color) || vehicle.colors[0];
  const selectedWheel =
    vehicle.wheels.find((w) => w.id === req.query.wheels) || vehicle.wheels[0];
  const selectedInterior =
    vehicle.interiors.find((i) => i.id === req.query.interior) || vehicle.interiors[0];

  const optionsPrice =
    selectedColor.price + selectedWheel.price + selectedInterior.price;
  const totalPrice = vehicle.basePrice + optionsPrice;

  res.render('pages/configurator', {
    title: 'Configurator',
    active: 'configurator',
    vehicle,
    selectedColor,
    selectedWheel,
    selectedInterior,
    optionsPrice,
    totalPrice,
    formatPrice,
    pageScript: 'ai-configurator.js',
  });
});

// Step 1: user clicked "Kaufen" in the configurator — render the checkout
// form (name + address) with a summary of the chosen configuration. No order
// is created yet, this is only a form preview.
app.post('/configurator/order', (req, res) => {
  const vehicle = defaultVehicle;
  const color = vehicle.colors.find((c) => c.id === req.body.colorId) || vehicle.colors[0];
  const wheels = vehicle.wheels.find((w) => w.id === req.body.wheelsId) || vehicle.wheels[0];
  const interior = vehicle.interiors.find((i) => i.id === req.body.interiorId) || vehicle.interiors[0];

  const total = vehicle.basePrice + color.price + wheels.price + interior.price;

  res.render('pages/checkout', {
    title: 'Checkout',
    active: '',
    checkoutType: 'vehicle',
    submitUrl: '/configurator/checkout',
    backUrl: '/configurator?color=' + color.id + '&wheels=' + wheels.id + '&interior=' + interior.id,
    summary: {
      heading: vehicle.name,
      subheading: vehicle.subtitle,
      image: (color && color.image) || vehicle.image,
      lineItems: [
        { label: 'Base Price',            value: formatPrice(vehicle.basePrice) },
        { label: 'Exterior — ' + color.name,    value: formatPrice(color.price) },
        { label: 'Wheels — ' + wheels.name,     value: formatPrice(wheels.price) },
        { label: 'Interior — ' + interior.name, value: formatPrice(interior.price) },
      ],
      total,
      totalFormatted: formatPrice(total),
    },
    // hidden fields so the next POST knows what was selected
    hidden: {
      vehicleId: vehicle.id,
      colorId: color.id,
      wheelsId: wheels.id,
      interiorId: interior.id,
    },
  });
});

// Step 2: user filled out name + address — actually place the order.
app.post('/configurator/checkout', async (req, res) => {
  const vehicle = defaultVehicle;
  const color = vehicle.colors.find((c) => c.id === req.body.colorId) || vehicle.colors[0];
  const wheels = vehicle.wheels.find((w) => w.id === req.body.wheelsId) || vehicle.wheels[0];
  const interior = vehicle.interiors.find((i) => i.id === req.body.interiorId) || vehicle.interiors[0];

  const total = vehicle.basePrice + color.price + wheels.price + interior.price;

  const customer = {
    fullName: (req.body.fullName || '').trim(),
    email:    (req.body.email || '').trim(),
    phone:    (req.body.phone || '').trim(),
  };
  const address = {
    street:  (req.body.street || '').trim(),
    zip:     (req.body.zip || '').trim(),
    city:    (req.body.city || '').trim(),
    country: (req.body.country || '').trim(),
  };

  const orderPayload = {
    type: 'vehicle',
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    config: {
      color:    { id: color.id, name: color.name, price: color.price },
      wheels:   { id: wheels.id, name: wheels.name, price: wheels.price },
      interior: { id: interior.id, name: interior.name, price: interior.price },
    },
    checkout: { customer, address },
    total,
    currency: 'USD',
  };

  try {
    const response = await axios.post(`${ORDER_SERVICE_URL}/api/orders`, orderPayload, {
      timeout: 5000,
    });
    const orderBody = unwrap(response.data) || response.data || {};
    const orderId = orderBody.orderId || orderBody.id || `AM-${new Date().getFullYear()}-LOCAL`;
    const issuedAt = orderBody.createdAt || new Date().toISOString();

    res.render('pages/order-confirmation', {
      title: 'Order Confirmed',
      active: '',
      success: true,
      invoice: {
        orderId,
        issuedAt,
        customer,
        address,
        heading: vehicle.name,
        subheading: vehicle.subtitle,
        image: (color && color.image) || vehicle.image,
        lineItems: [
          { label: 'Base Price',                  value: vehicle.basePrice, formatted: formatPrice(vehicle.basePrice) },
          { label: 'Exterior — ' + color.name,    value: color.price,       formatted: formatPrice(color.price) },
          { label: 'Wheels — ' + wheels.name,     value: wheels.price,      formatted: formatPrice(wheels.price) },
          { label: 'Interior — ' + interior.name, value: interior.price,    formatted: formatPrice(interior.price) },
        ],
        subtotal: total,
        subtotalFormatted: formatPrice(total),
        shipping: 0,
        shippingFormatted: 'Included',
        total,
        totalFormatted: formatPrice(total),
        currency: 'USD',
      },
      errorMessage: null,
    });
  } catch (err) {
    console.error('Order service error:', err.message);
    res.status(502).render('pages/order-confirmation', {
      title: 'Order Failed',
      active: '',
      success: false,
      invoice: null,
      errorMessage: err.message,
    });
  }
});

app.get('/merchandise', async (req, res) => {
  const requested = req.query.category;
  const activeCategory =
    requested && categories.includes(requested) ? requested : 'New Arrivals';

  const filtered =
    activeCategory === 'New Arrivals'
      ? products
      : products.filter(
          (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
        );

  const featuredProduct = filtered.find((p) => p.featured) || null;
  const regularProducts = filtered.filter((p) => p !== featuredProduct);

  const cart = await fetchCart(req.cookies[CART_COOKIE]);
  const subtotal = cart && cart.summary ? cart.summary.subtotal : 0;
  const shipping = cart && cart.items && cart.items.length > 0 ? 25 : 0;
  const total = subtotal + shipping;

  res.render('pages/merchandise', {
    title: 'Merchandise',
    active: 'merchandise',
    categories,
    activeCategory,
    featuredProduct,
    regularProducts,
    cart,
    productMap,
    shipping,
    total,
  });
});

app.get('/cart', async (req, res) => {
  const cart = await fetchCart(req.cookies[CART_COOKIE]);
  const subtotal = cart && cart.summary ? cart.summary.subtotal : 0;
  const shipping = cart && cart.items && cart.items.length > 0 ? 25 : 0;
  const total = subtotal + shipping;

  res.render('pages/cart', {
    title: 'Cart',
    active: '',
    cart,
    productMap,
    shipping,
    total,
  });
});

app.post('/cart/add', async (req, res) => {
  const { productId, returnTo } = req.body;
  const product = productMap[productId];
  if (!product) {
    return res.redirect(303, returnTo || '/merchandise');
  }
  const cart = await ensureCart(req, res);
  if (!cart) {
    return res.redirect(303, returnTo || '/merchandise');
  }
  try {
    await axios.post(
      `${CART_SERVICE_URL}/api/cart/${cart.id}/items`,
      { productId, quantity: 1, configuration: {} },
      { timeout: 3000 }
    );
  } catch (err) {
    console.warn('[cart] add failed:', err.message);
  }
  res.redirect(303, returnTo || '/merchandise');
});

app.post('/cart/items/:itemId/update', async (req, res) => {
  const cartId = req.cookies[CART_COOKIE];
  const quantity = parseInt(req.body.quantity, 10);
  if (cartId && Number.isFinite(quantity) && quantity > 0) {
    try {
      await axios.patch(
        `${CART_SERVICE_URL}/api/cart/${cartId}/items/${req.params.itemId}`,
        { quantity },
        { timeout: 3000 }
      );
    } catch (err) {
      console.warn('[cart] update failed:', err.message);
    }
  }
  res.redirect(303, '/cart');
});

app.post('/cart/items/:itemId/remove', async (req, res) => {
  const cartId = req.cookies[CART_COOKIE];
  if (cartId) {
    try {
      await axios.delete(
        `${CART_SERVICE_URL}/api/cart/${cartId}/items/${req.params.itemId}`,
        { timeout: 3000 }
      );
    } catch (err) {
      console.warn('[cart] remove failed:', err.message);
    }
  }
  res.redirect(303, '/cart');
});

app.post('/cart/clear', async (req, res) => {
  const cartId = req.cookies[CART_COOKIE];
  if (cartId) {
    try {
      await axios.delete(`${CART_SERVICE_URL}/api/cart/${cartId}`, { timeout: 3000 });
    } catch (err) {
      console.warn('[cart] clear failed:', err.message);
    }
  }
  res.redirect(303, '/cart');
});

// Step 1: render checkout form (cart contents + address fields).
app.post('/cart/checkout', async (req, res) => {
  const cart = await fetchCart(req.cookies[CART_COOKIE]);
  if (!cart || !cart.items || cart.items.length === 0) {
    return res.redirect(303, '/cart');
  }
  const subtotal = cart.summary ? cart.summary.subtotal : 0;
  const shipping = 25;
  const total = subtotal + shipping;

  res.render('pages/checkout', {
    title: 'Checkout',
    active: '',
    checkoutType: 'merchandise',
    submitUrl: '/cart/checkout/confirm',
    backUrl: '/cart',
    summary: {
      heading: 'Merchandise Order',
      subheading: cart.items.length + ' item' + (cart.items.length === 1 ? '' : 's'),
      image: null,
      lineItems: cart.items.map((i) => ({
        label: i.name + ' × ' + i.quantity,
        value: formatPrice(i.lineTotal),
      })).concat([
        { label: 'Subtotal', value: formatPrice(subtotal) },
        { label: 'Shipping', value: formatPrice(shipping) },
      ]),
      total,
      totalFormatted: formatPrice(total),
    },
    hidden: {},
  });
});

// Step 2: finalize the merchandise order with the customer + address data.
app.post('/cart/checkout/confirm', async (req, res) => {
  const cart = await fetchCart(req.cookies[CART_COOKIE]);
  if (!cart || !cart.items || cart.items.length === 0) {
    return res.redirect(303, '/cart');
  }
  const subtotal = cart.summary ? cart.summary.subtotal : 0;
  const shipping = 25;
  const total = subtotal + shipping;

  const customer = {
    fullName: (req.body.fullName || '').trim(),
    email:    (req.body.email || '').trim(),
    phone:    (req.body.phone || '').trim(),
  };
  const address = {
    street:  (req.body.street || '').trim(),
    zip:     (req.body.zip || '').trim(),
    city:    (req.body.city || '').trim(),
    country: (req.body.country || '').trim(),
  };

  const orderPayload = {
    type: 'merchandise',
    cartId: cart.id,
    items: cart.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
    })),
    checkout: { customer, address },
    subtotal,
    shipping,
    total,
    currency: 'USD',
  };

  try {
    const response = await axios.post(`${ORDER_SERVICE_URL}/api/orders`, orderPayload, {
      timeout: 5000,
    });
    const orderBody = unwrap(response.data) || response.data || {};
    const orderId = orderBody.orderId || orderBody.id || `AM-${new Date().getFullYear()}-LOCAL`;
    const issuedAt = orderBody.createdAt || new Date().toISOString();

    try {
      await axios.delete(`${CART_SERVICE_URL}/api/cart/${cart.id}`, { timeout: 3000 });
    } catch (err) {
      console.warn('[cart] clear-after-checkout failed:', err.message);
    }
    res.clearCookie(CART_COOKIE);

    res.render('pages/order-confirmation', {
      title: 'Order Confirmed',
      active: '',
      success: true,
      invoice: {
        orderId,
        issuedAt,
        customer,
        address,
        heading: 'Merchandise Order',
        subheading: cart.items.length + ' item' + (cart.items.length === 1 ? '' : 's'),
        image: null,
        lineItems: cart.items.map((i) => ({
          label: i.name + ' × ' + i.quantity,
          value: i.lineTotal,
          formatted: formatPrice(i.lineTotal),
        })),
        subtotal,
        subtotalFormatted: formatPrice(subtotal),
        shipping,
        shippingFormatted: formatPrice(shipping),
        total,
        totalFormatted: formatPrice(total),
        currency: 'USD',
      },
      errorMessage: null,
    });
  } catch (err) {
    console.error('Order service error:', err.message);
    res.status(502).render('pages/order-confirmation', {
      title: 'Order Failed',
      active: '',
      success: false,
      invoice: null,
      errorMessage: err.message,
    });
  }
});

app.get('/gallery', (req, res) => {
  const heroItem =
    galleryItems.find((i) => i.id === 'zenith-manifesto') || galleryItems[0];
  const fleetItem =
    galleryItems.find((i) => i.id === 'the-fleet-evolution') || galleryItems[0];
  const gridItems = galleryItems.filter(
    (i) => i.id !== heroItem.id && i.id !== fleetItem.id
  );

  res.render('pages/gallery', {
    title: 'Gallery',
    active: 'gallery',
    heroItem,
    fleetItem,
    gridItems,
  });
});

app.get('/roadmap', async (req, res) => {
  // Local fallback data so the page always renders even if the
  // roadmap-service hasn't booted yet — the Leaflet client will
  // poll /api/presentation/* and recover automatically.
  const fallback = {
    routeEvent: routeEvent,
    countdown: countdown,
    telemetry: telemetry,
    waypoints: waypoints,
    mapImage: mapImage,
  };

  let data = fallback;
  try {
    data = await fetchRoadmapData();
  } catch (err) {
    console.warn('[roadmap] using fallback data:', err.message);
  }

  res.render('pages/roadmap', {
    title: 'Roadmap',
    active: 'roadmap',
    routeEvent: data.routeEvent || fallback.routeEvent,
    countdown: data.countdown || fallback.countdown,
    telemetry: data.telemetry || fallback.telemetry,
    waypoints: data.waypoints || fallback.waypoints,
    mapImage: data.mapImage || fallback.mapImage,
    pageStyles: ['https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'],
    pageScripts: [
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
      '/js/presentation-map.js',
      '/js/countdown.js',
    ],
  });
});

// ── API ────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'web-shop-backend', timestamp: new Date().toISOString() });
});

async function proxyRequest(req, res, targetBaseUrl) {
  const targetUrl = `${targetBaseUrl}${req.path}`;
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      params: req.query,
      data: req.body,
      headers: { 'Content-Type': req.headers['content-type'] || 'application/json' },
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

app.all('/api/products*', (req, res) => proxyRequest(req, res, PRODUCT_SERVICE_URL));
app.all('/api/cart*', (req, res) => proxyRequest(req, res, CART_SERVICE_URL));
app.all('/api/orders*', (req, res) => proxyRequest(req, res, ORDER_SERVICE_URL));

// ── 404 ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('pages/placeholder', {
    title: 'Not Found',
    active: '',
    heading: '404',
    phase: 'a future release',
  });
});

app.listen(PORT, () => {
  console.log(`web-shop-backend running on port ${PORT}`);
  console.log(`  PRODUCT_SERVICE_URL: ${PRODUCT_SERVICE_URL}`);
  console.log(`  CART_SERVICE_URL:    ${CART_SERVICE_URL}`);
  console.log(`  ORDER_SERVICE_URL:   ${ORDER_SERVICE_URL}`);
});
