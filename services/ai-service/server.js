const express = require('express');

const app = express();
const PORT = 3006;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ai-service' });
});

// AI recommendation endpoint
app.post('/ai/recommend', (req, res) => {
  const { preferences } = req.body;

  if (!preferences) {
    return res.status(400).json({ error: 'Preferences are required' });
  }

  // TODO: Integrate with Google Gemini API for actual recommendations
  // This is a placeholder response structure
  const recommendation = {
    recommendation: 'Placeholder recommendation based on user preferences',
    preferences: preferences,
    confidence: 0.85,
    reasoning: 'TODO: Implement Gemini API integration for dynamic recommendations',
    alternatives: []
  };

  res.json(recommendation);
});

// AI chat endpoint
app.post('/ai/chat', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // TODO: Integrate with Google Gemini API for actual chat responses
  // This is a placeholder response structure
  const chatResponse = {
    response: 'Placeholder response to your message',
    message: message,
    timestamp: new Date().toISOString(),
    note: 'TODO: Implement Gemini API integration for conversational AI'
  };

  res.json(chatResponse);
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
