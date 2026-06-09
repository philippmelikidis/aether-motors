# AI Service

AI-powered recommendations via Google Gemini.

## Overview

The AI Service provides intelligent recommendations and conversational AI capabilities powered by Google Gemini. It handles user preferences analysis and natural language interactions across the Aether Motors platform.

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm
- Google Gemini API key (for full functionality)

### Installation

```bash
npm install
```

### Configuration

Set up environment variables:
```bash
# Required for AI responses
export GEMINI_API_KEY=your_api_key_here

# Optional overrides
export GEMINI_MODEL=gemini-3.1-flash-lite
export PRODUCT_SERVICE_URL=http://product-service:3001
```

If you run the AI Service locally (outside Docker), set:
```bash
export PRODUCT_SERVICE_URL=http://localhost:3001
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

The service will start on port 3006.

## API Endpoints

### Health Check
- `GET /health` - Returns service health status

### AI Endpoints
- `GET /ai/options` - Returns the configuration tree assembled from the Product Service

- `POST /ai/configure` - Generate a configuration from free text
  - Request body: `{ "text": "...", "config": { "temperature": 0.2, "maxOutputTokens": 512 } }`
  - Response: `{ "configuration": { "model": "...", "selections": { "<category>": "<optionSlug>" } }, "reasoning": { "model": "...", "selections": { "<category>": "<shortReason>" } }, "summary": "...", "meta": { "model": "..." } }`

### Example Request

```bash
curl -X POST http://localhost:3006/ai/configure \
  -H "Content-Type: application/json" \
  -d '{"text":"Ich will einen sportlichen, aber alltagstauglichen Wagen in dunkler Farbe mit hochwertigem Innenraum."}'
```

## Integration Notes

The AI endpoints call Google Gemini directly and return the JSON response from the model. Make sure the Product Service is reachable, otherwise `/ai/options` and `/ai/configure` return HTTP 503.

## Project Structure

`server.js` is a thin bootstrap that wires up the Express app and starts listening. All logic lives under `src/`, split into layers:

```
server.js                         # entry point: app.listen
src/
  app.js                          # builds the Express app and mounts routes
  config.js                       # env vars + Gemini client initialisation
  routes/
    ai.routes.js                  # maps HTTP routes to controller handlers
  controllers/
    ai.controller.js              # request/response handlers (health, options, configure)
  services/
    fallback.js                   # deterministic fallback configurator
  integrations/
    gemini.js                     # Google Gemini client + model factory
    product-service.js            # Product Service catalog fetching
  utils/
    prompt.js                     # prompt building + JSON extraction
  validation/
    schemas.js                    # Zod request/response schemas
```

## Docker

Build the image:
```bash
docker build -t ai-service .
```

Run the container:
```bash
docker run -p 3006:3006 -e GEMINI_API_KEY=your_key ai-service
```