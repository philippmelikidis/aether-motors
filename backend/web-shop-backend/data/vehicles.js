// ---------------------------------------------------------------------------
// Aether Motors – vehicle catalogue consumed by the SSR configurator page.
//
// Image strategy: pre-rendered combinations.
// For each (colour, wheel) selection we ship one fully-rendered body shot —
// no runtime layering, no wheel overlays. The helper `bodyImageFor(colorId,
// wheelId)` returns the MinIO key for the matching render. Naming convention:
//
//   vehicles/project-zenith-<colorId>-<wheelSuffix>.png
//
// where <wheelSuffix> maps `aero-blade-21` → "aero" and
// `onyx-turbine-22` → "onyx". All six combinations must exist in MinIO,
// otherwise the configurator falls back to the base vehicle image and the
// wheel option silently has no visual effect.
// ---------------------------------------------------------------------------

const { mediaUrl } = require('../lib/media');

const WHEEL_SUFFIX = {
  'aero-blade-21':   'aero',
  'onyx-turbine-22': 'onyx',
};

function bodyImageFor(colorId, wheelId) {
  const suffix = WHEEL_SUFFIX[wheelId];
  if (!suffix) {
    // Unknown wheel option — fall back to the colour-only render so the page
    // still works while new wheel SKUs are being onboarded.
    return mediaUrl(`vehicles/project-zenith-${colorId}.png`);
  }
  return mediaUrl(`vehicles/project-zenith-${colorId}-${suffix}.png`);
}

const vehicles = [
  {
    id: 'project-zenith',
    name: 'Project Zenith',
    subtitle: 'V12 Hybrid Concept',
    image: mediaUrl('vehicles/project-zenith'),
    basePrice: 142000,
    specs: [
      { label: 'Acceleration', value: '1.9', unit: 's' },
      { label: 'Range', value: '640', unit: 'km' },
      { label: 'Top Speed', value: '325', unit: 'km/h' },
    ],
    colors: [
      {
        id: 'metallic-blue', name: 'Metallic Blue',
        hex: '#00daf8', hexTo: '#004e5a', price: 0,
      },
      {
        id: 'matte-charcoal', name: 'Matte Charcoal',
        hex: '#292a2b', hexTo: '#1a1a1a', price: 2200,
      },
      {
        id: 'pearl-white', name: 'Pearl White',
        hex: '#e3e2e3', hexTo: '#c4c4c4', price: 1800,
      },
    ],
    wheels: [
      {
        id: 'aero-blade-21', name: '21" Aero Blade',
        description: 'Optimized Drag', icon: 'blur_circular', price: 0,
        image: mediaUrl('vehicles/wheels/aero-blade-21.png'),
      },
      {
        id: 'onyx-turbine-22', name: '22" Onyx Turbine',
        description: 'Forged Carbon', icon: 'toll', price: 4500,
        image: mediaUrl('vehicles/wheels/onyx-turbine-22.png'),
      },
    ],
    interiors: [
      {
        id: 'cyber-knit', name: 'Cyber Knit',
        material: 'Recycled PET', price: 0,
        image: mediaUrl('vehicles/interiors/cyber-knit.png'),
      },
      {
        id: 'vegan-suede', name: 'Vegan Suede',
        material: 'Active Mesh', price: 3200,
        image: mediaUrl('vehicles/interiors/vegan-suede.png'),
      },
      {
        id: 'leather-package', name: 'Leather Package',
        material: 'Premium Leather', price: 10000,
        image: mediaUrl('vehicles/interiors/leather-package.png'),
      },
    ],
  },
];

const defaultVehicle = vehicles[0];

module.exports = { vehicles, defaultVehicle, bodyImageFor };
