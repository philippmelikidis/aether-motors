const express = require('express');

const app = express();
const PORT = 3004;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'media-service' });
});

// Get all media
app.get('/media', (req, res) => {
  const mediaList = [
    {
      id: 1,
      type: 'image',
      url: 'https://example.com/images/vehicle-01.jpg',
      alt: 'Electric vehicle exterior view'
    },
    {
      id: 2,
      type: 'video',
      url: 'https://example.com/videos/demo-01.mp4',
      alt: 'Vehicle demonstration video'
    },
    {
      id: 3,
      type: '3d-asset',
      url: 'https://example.com/assets/vehicle-model.glb',
      alt: 'Interactive 3D vehicle model'
    },
    {
      id: 4,
      type: 'image',
      url: 'https://example.com/images/interior-01.jpg',
      alt: 'Vehicle interior details'
    }
  ];

  res.json(mediaList);
});

// Get specific media by ID
app.get('/media/:id', (req, res) => {
  const { id } = req.params;

  const mediaList = [
    {
      id: 1,
      type: 'image',
      url: 'https://example.com/images/vehicle-01.jpg',
      alt: 'Electric vehicle exterior view'
    },
    {
      id: 2,
      type: 'video',
      url: 'https://example.com/videos/demo-01.mp4',
      alt: 'Vehicle demonstration video'
    },
    {
      id: 3,
      type: '3d-asset',
      url: 'https://example.com/assets/vehicle-model.glb',
      alt: 'Interactive 3D vehicle model'
    },
    {
      id: 4,
      type: 'image',
      url: 'https://example.com/images/interior-01.jpg',
      alt: 'Vehicle interior details'
    }
  ];

  const media = mediaList.find(m => m.id === parseInt(id));

  if (!media) {
    return res.status(404).json({ error: 'Media not found' });
  }

  res.json(media);
});

app.listen(PORT, () => {
  console.log(`Media Service running on port ${PORT}`);
});
