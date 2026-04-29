const vehicles = [
  {
    id: 'project-zenith',
    name: 'Project Zenith',
    subtitle: 'V12 Hybrid Concept',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAttOYZxqZWqwfqWjtn9cb8_dBAm9w9HmGqghvYSRpVpGZ3UEmQL0PwmXqLIR-kflvbydea0TU1qAJCN9VXnQRkywVlzGz-muoSE8VgODS_jE3c2ZGgWMIYSXtT2JHfzKBnhDtfxJmOupFtVIc_LXplcTwY7TrLT49rJDo6DtkhzfvE_A-ShgxrzvPsaGIxoNsfGyP-yprHAcHBnSTLIdLSPpTTV7yPk-Uqd4A3BB3gbnWAxOzwmWxsbkXF8LdJdroJQYClpiq1aNmP=w2048',
    basePrice: 142000,
    specs: [
      { label: 'Acceleration', value: '1.9', unit: 's' },
      { label: 'Range', value: '640', unit: 'km' },
      { label: 'Top Speed', value: '325', unit: 'km/h' },
    ],
    colors: [
      { id: 'metallic-blue', name: 'Metallic Blue', hex: '#00daf8', hexTo: '#004e5a', price: 0 },
      { id: 'matte-charcoal', name: 'Matte Charcoal', hex: '#292a2b', hexTo: '#1a1a1a', price: 2200 },
      { id: 'pearl-white', name: 'Pearl White', hex: '#e3e2e3', hexTo: '#c4c4c4', price: 1800 },
    ],
    wheels: [
      { id: 'aero-blade-21', name: '21" Aero Blade', description: 'Optimized Drag', icon: 'blur_circular', price: 0 },
      { id: 'onyx-turbine-22', name: '22" Onyx Turbine', description: 'Forged Carbon', icon: 'toll', price: 4500 },
    ],
    interiors: [
      { id: 'cyber-knit', name: 'Cyber Knit', material: 'Recycled PET', price: 0 },
      { id: 'vegan-suede', name: 'Vegan Suede', material: 'Active Mesh', price: 3200 },
    ],
  },
];

const defaultVehicle = vehicles[0];

module.exports = { vehicles, defaultVehicle };
