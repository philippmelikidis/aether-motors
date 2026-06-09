const fetch = require('node-fetch');

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Product service error (${res.status}) for ${url}`);
  }

  return res.json();
}

async function getConfigurableVehicles(baseUrl) {
  const json = await fetchJson(`${baseUrl}/api/vehicles`);
  return (json.data || []).map((vehicle) => vehicle.VehicleSlug);
}

async function getConfigurableVehicle(baseUrl, vehicleSlug) {
  const json = await fetchJson(`${baseUrl}/api/vehicles/${vehicleSlug}`);
  return {
    vehicle: json.vehicle,
    options: json.options,
  };
}

async function buildConfigurationTree(baseUrl) {
  const vehicleSlugs = await getConfigurableVehicles(baseUrl);
  const details = await Promise.all(
    vehicleSlugs.map((slug) => getConfigurableVehicle(baseUrl, slug))
  );

  const tree = { models: {} };

  details.forEach(({ vehicle, options }) => {
    if (!vehicle) {
      return;
    }

    tree.models[vehicle.VehicleSlug] = {
      vehicle,
      options: options || {},
    };
  });

  return tree;
}

module.exports = {
  getConfigurableVehicles,
  getConfigurableVehicle,
  buildConfigurationTree,
};
