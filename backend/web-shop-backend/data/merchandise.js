const { mediaUrl } = require('../lib/media');
const products = [
  {
    id: 'zenith-shell-v1',
    name: 'ZENITH SHELL V.1',
    description: 'Waterproof modular jacket with haptic feedback sensors',
    price: 450,
    image:
      mediaUrl('merchandise/zenith-shell-v1'),
    category: 'technical',
    featured: true,
  },
  {
    id: 'chronos-ti-link',
    name: 'CHRONOS TI-LINK',
    description: 'Precision machined titanium wearable',
    price: 1200,
    image:
      mediaUrl('merchandise/chronos-ti-link'),
    category: 'collectibles',
    badge: 'LIMITED',
  },
  {
    id: 'velocity-01-shoe',
    name: 'VELOCITY 01 SHOE',
    description: 'Driving performance shoe',
    price: 280,
    image:
      mediaUrl('merchandise/velocity-01-shoe'),
    category: 'technical',
  },
  {
    id: 'zenith-diecast-1-18',
    name: '1:18 ZENITH DIECAST',
    description: 'Hand-assembled precision scale model',
    price: 550,
    image:
      mediaUrl('merchandise/zenith-diecast'),
    category: 'collectibles',
  },
  {
    id: 'schematic-tee',
    name: 'SCHEMATIC TEE',
    description: '100% organic heavy-weight cotton',
    price: 85,
    image:
      mediaUrl('merchandise/schematic-tee'),
    category: 'apparel',
  },
];

const categories = ['New Arrivals', 'Collectibles', 'Technical'];

module.exports = { products, categories };
