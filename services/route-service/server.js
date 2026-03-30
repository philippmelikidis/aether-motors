const express = require('express');

const app = express();
const PORT = 3005;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'route-service' });
});

// Get all routes
app.get('/routes', (req, res) => {
  const routes = [
    {
      path: '/',
      component: 'HomePage',
      title: 'Home'
    },
    {
      path: '/about',
      component: 'AboutPage',
      title: 'About Us'
    },
    {
      path: '/vehicles',
      component: 'VehiclesPage',
      title: 'Our Vehicles'
    },
    {
      path: '/vehicles/:id',
      component: 'VehicleDetailPage',
      title: 'Vehicle Details'
    },
    {
      path: '/contact',
      component: 'ContactPage',
      title: 'Contact Us'
    },
    {
      path: '/configurator',
      component: 'ConfiguratorPage',
      title: 'Vehicle Configurator'
    },
    {
      path: '/dashboard',
      component: 'DashboardPage',
      title: 'Dashboard'
    }
  ];

  res.json(routes);
});

// Get specific route by path
app.get('/routes/:path', (req, res) => {
  const { path } = req.params;
  const decodedPath = decodeURIComponent(path);

  const routes = [
    {
      path: '/',
      component: 'HomePage',
      title: 'Home'
    },
    {
      path: '/about',
      component: 'AboutPage',
      title: 'About Us'
    },
    {
      path: '/vehicles',
      component: 'VehiclesPage',
      title: 'Our Vehicles'
    },
    {
      path: '/vehicles/:id',
      component: 'VehicleDetailPage',
      title: 'Vehicle Details'
    },
    {
      path: '/contact',
      component: 'ContactPage',
      title: 'Contact Us'
    },
    {
      path: '/configurator',
      component: 'ConfiguratorPage',
      title: 'Vehicle Configurator'
    },
    {
      path: '/dashboard',
      component: 'DashboardPage',
      title: 'Dashboard'
    }
  ];

  const route = routes.find(r => r.path === decodedPath);

  if (!route) {
    return res.status(404).json({ error: 'Route not found' });
  }

  res.json(route);
});

app.listen(PORT, () => {
  console.log(`Route Service running on port ${PORT}`);
});
