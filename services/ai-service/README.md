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
export GEMINI_API_KEY=your_api_key_here
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
- `POST /ai/recommend` - Get personalized recommendations
  - Request body: `{ "preferences": {...} }`
  - Returns recommendation with confidence and reasoning

- `POST /ai/chat` - Conversational AI chat
  - Request body: `{ "message": "your message" }`
  - Returns AI response

## Integration Notes

The AI endpoints currently return placeholder responses. To integrate with Google Gemini:

1. Install the Gemini SDK: `npm install @google/generative-ai`
2. Implement API calls in the `/ai/recommend` and `/ai/chat` endpoints
3. Configure your API key in environment variables
4. Update error handling and response formatting as needed

## Docker

Build the image:
```bash
docker build -t ai-service .
```

Run the container:
```bash
docker run -p 3006:3006 -e GEMINI_API_KEY=your_key ai-service
```

## License

MIT
