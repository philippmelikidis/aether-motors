/* For the Navigation Bar */

const navLinks = [
  { href: '/configurator', label: 'Configurator', key: 'configurator' },
  { href: '/merchandise', label: 'Merchandise', key: 'merchandise' },
  { href: '/gallery', label: 'Gallery', key: 'gallery' },
  { href: '/roadmap', label: 'Roadmap', key: 'roadmap' }
];


/* For the Cards on the Home Page */
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

module.exports = {
  navLinks,
  navCards
};