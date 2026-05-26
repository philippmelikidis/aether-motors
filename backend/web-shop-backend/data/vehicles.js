const vehicles = [
  {
    id: 'project-zenith',
    name: 'Project Zenith',
    subtitle: 'V12 Hybrid Concept',
    // Top-level fallback image (used if the per-color image is missing)
    image: '/images/vehicles/project-zenith-default.png',
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
        image: '/images/vehicles/project-zenith-metallic-blue.png',
      },
      {
        id: 'matte-charcoal', name: 'Matte Charcoal',
        hex: '#292a2b', hexTo: '#1a1a1a', price: 2200,
        image: '/images/vehicles/project-zenith-matte-charcoal.png',
      },
      {
        id: 'pearl-white', name: 'Pearl White',
        hex: '#e3e2e3', hexTo: '#c4c4c4', price: 1800,
        image: '/images/vehicles/project-zenith-pearl-white.png',
      },
    ],
    wheels: [
      {
        id: 'aero-blade-21', name: '21" Aero Blade',
        description: 'Optimized Drag', icon: 'blur_circular', price: 0,
        image: '/images/wheels/aero-blade-21.png',
      },
      {
        id: 'onyx-turbine-22', name: '22" Onyx Turbine',
        description: 'Forged Carbon', icon: 'toll', price: 4500,
        image: '/images/wheels/onyx-turbine-22.png',
      },
    ],
    interiors: [
      {
        id: 'cyber-knit', name: 'Cyber Knit',
        material: 'Recycled PET', price: 0,
        image: '/images/interiors/cyber-knit.png',
      },
      {
        id: 'vegan-suede', name: 'Vegan Suede',
        material: 'Active Mesh', price: 3200,
        image: '/images/interiors/vegan-suede.png',
      },
    ],
  },
];

const defaultVehicle = vehicles[0];

module.exports = { vehicles, defaultVehicle };
