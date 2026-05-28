const { mediaUrl } = require('../lib/media');
const galleryItems = [
  {
    id: 'kinetic-sculpting',
    title: 'Kinetic Sculpting',
    subtitle: 'Series Alpha',
    image:
      mediaUrl('gallery/kinetic-sculpting'),
    type: 'image',
    category: 'Design',
    featured: true,
    span: 'large',
  },
  {
    id: 'the-cockpit',
    title: 'The Cockpit',
    subtitle: 'Biometric integration',
    image:
      mediaUrl('gallery/the-cockpit'),
    type: 'image',
    category: 'Interior',
    span: 'medium',
  },
  {
    id: 'v12-acoustic-test',
    title: 'V12 Acoustic Test',
    image:
      mediaUrl('gallery/v12-acoustic-test'),
    type: 'video',
    duration: '04:12',
    category: 'Engineering',
    span: 'medium',
  },
  {
    id: 'carbon-lite-alloys',
    title: 'Carbon-Lite Alloys',
    image:
      mediaUrl('gallery/carbon-lite-alloys'),
    type: 'image',
    category: 'Materials',
    span: 'small',
  },
  {
    id: 'the-fleet-evolution',
    title: 'The Fleet Evolution',
    image:
      mediaUrl('gallery/the-fleet-evolution'),
    type: 'image',
    category: 'Fleet',
    span: 'large',
  },
  {
    id: 'zenith-manifesto',
    title: 'The Zenith Manifesto',
    subtitle: 'Now Premiering',
    image:
      mediaUrl('gallery/zenith-manifesto'),
    type: 'video',
    category: 'Film',
    featured: true,
    span: 'large',
  },
];

module.exports = { galleryItems };
