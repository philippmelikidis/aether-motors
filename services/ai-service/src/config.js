const dotenv = require('dotenv');
const { createGeminiClient } = require('./integrations/gemini');

dotenv.config();

const PORT = process.env.PORT || 3006;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

// Initialize Gemini client if API key is provided
const apiKey = process.env.GEMINI_API_KEY;
const genAI = createGeminiClient(apiKey);
const aiEnabled = Boolean(genAI);

if (!aiEnabled) {
  console.warn(
    '[ai-service] GEMINI_API_KEY missing – /ai/configure will return ' +
      'deterministic fallback configurations (meta.fallback = true).'
  );
}

module.exports = {
  PORT,
  MODEL_NAME,
  PRODUCT_SERVICE_URL,
  genAI,
  aiEnabled,
};
