const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const path = require('path');

const { defaultVehicle } = require('./data/vehicles');
const { galleryItems } = require('./data/gallery');
const { products, categories } = require('./data/merchandise');
const { routeEvent, countdown, telemetry, waypoints, mapImage } = require('./data/route');

const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
const CART_COOKIE = 'aether_cart_id';
const CART_COOKIE_OPTS = { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 30 };

const app = express();
const PORT = process.env.PORT || 3000;

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

const navCards = [
  {
    title: 'Configurator',
    description: 'Sculpt your Aether — colour, wheels, interior. Every detail engineered.',
    href: '/configurator',
    icon: 'tune',
  },
  {
    title: 'Gallery',
    description: 'A visual archive of design, engineering, and the films that shape the brand.',
    href: '/gallery',
    icon: 'collections',
  },
  {
    title: 'Merchandise',
    description: 'Apparel, collectibles, and technical gear. Engineered with the same obsession.',
    href: '/merchandise',
    icon: 'storefront',
  },
  {
    title: 'Roadmap',
    description: 'Live route telemetry — track the global premiere of Project Zenith.',
    href: '/roadmap',
    icon: 'route',
  },
];

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
app.set('layout', 'layout');
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
  });
});

app.post('/configurator/order', async (req, res) => {
  const vehicle = defaultVehicle;
  const color = vehicle.colors.find((c) => c.id === req.body.colorId) || vehicle.colors[0];
  const wheels = vehicle.wheels.find((w) => w.id === req.body.wheelsId) || vehicle.wheels[0];
  const interior = vehicle.interiors.find((i) => i.id === req.body.interiorId) || vehicle.interiors[0];

  const total = vehicle.basePrice + color.price + wheels.price + interior.price;

  const orderPayload = {
    type: 'vehicle',
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    config: {
      color: { id: color.id, name: color.name, price: color.price },
      wheels: { id: wheels.id, name: wheels.name, price: wheels.price },
      interior: { id: interior.id, name: interior.name, price: interior.price },
    },
    total,
    currency: 'USD',
  };

  try {
    const response = await axios.post(`${ORDER_SERVICE_URL}/api/orders`, orderPayload, {
      timeout: 5000,
    });
    const orderId = response.data && (response.data.orderId || response.data.id)
      ? response.data.orderId || response.data.id
      : `local-${Date.now()}`;

    res.render('pages/order-confirmation', {
      title: 'Order Confirmed',
      active: '',
        success: true,
      order: {
        orderId,
        vehicleName: vehicle.name,
        color: color.name,
        wheels: wheels.name,
        interior: interior.name,
        totalFormatted: formatPrice(total),
      },
      errorMessage: null,
    });
  } catch (err) {
    console.error('Order service error:', err.message);
    res.status(502).render('pages/order-confirmation', {
      title: 'Order Failed',
      active: '',
        success: false,
      order: null,
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

app.post('/cart/checkout', async (req, res) => {
  const cart = await fetchCart(req.cookies[CART_COOKIE]);
  if (!cart || !cart.items || cart.items.length === 0) {
    return res.redirect(303, '/cart');
  }
  const subtotal = cart.summary ? cart.summary.subtotal : 0;
  const shipping = 25;
  const total = subtotal + shipping;

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
    subtotal,
    shipping,
    total,
    currency: 'USD',
  };

  try {
    const response = await axios.post(`${ORDER_SERVICE_URL}/api/orders`, orderPayload, {
      timeout: 5000,
    });
    const orderId =
      (response.data && (response.data.orderId || response.data.id)) ||
      `local-${Date.now()}`;

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
      order: {
        orderId,
        vehicleName: 'Merchandise Order',
        color: `${cart.items.length} item${cart.items.length === 1 ? '' : 's'}`,
        wheels: `Subtotal ${formatPrice(subtotal)}`,
        interior: `Shipping ${formatPrice(shipping)}`,
        totalFormatted: formatPrice(total),
      },
      errorMessage: null,
    });
  } catch (err) {
    console.error('Order service error:', err.message);
    res.status(502).render('pages/order-confirmation', {
      title: 'Order Failed',
      active: '',
      success: false,
      order: null,
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

app.get('/roadmap', (req, res) => {
  res.render('pages/roadmap', {
    title: 'Roadmap',
    active: 'roadmap',
    routeEvent,
    countdown,
    telemetry,
    waypoints,
    mapImage,
    pageScript: 'countdown.js',
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
