# Media Service

Media content service for images, videos, and 3D assets.

## Overview

The Media Service provides endpoints for retrieving media content including images, videos, and 3D assets used throughout the Aether Motors platform.

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm

### Installation

```bash
npm install
```

### Running the Service

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The service will start on port 3004.

## API Endpoints

### Health Check
- `GET /health` - Returns service health status

### Media Endpoints
- `GET /media` - Retrieve all media items
- `GET /media/:id` - Retrieve a specific media item by ID

## Media Object Structure

```json
{
  "id": 1,
  "type": "image|video|3d-asset",
  "url": "https://example.com/media/file",
  "alt": "Description of the media"
}
```

## Docker

Build the image:
```bash
docker build -t media-service .
```

Run the container:
```bash
docker run -p 3004:3004 media-service
```

## License

MIT
