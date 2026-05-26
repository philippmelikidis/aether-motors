const express = require('express');
const dotenv = require('dotenv');
const { requestSchema } = require('./lib/schemas');
const { createGeminiClient, getConfigModel } = require('./lib/gemini');
const { buildConfigurationTree } = require('./lib/product-service');
const { buildConfigPrompt, extractJson } = require('./lib/prompt');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

app.use(express.json());

// Initialize Gemini client if API key is provided
const apiKey = process.env.GEMINI_API_KEY;
const genAI = createGeminiClient(apiKey);

// Endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ai-service' });
});

app.get('/ai/options', async (req, res) => {
  try {
    const tree = await buildConfigurationTree(PRODUCT_SERVICE_URL);
    res.json({ options: tree });
  } catch (error) {
    res.status(503).json({ error: 'Catalog unavailable', details: error.message });
  }
});

app.post('/ai/configure', async (req, res) => {
  const parsedRequest = requestSchema.safeParse(req.body);

  if (!parsedRequest.success) {
    return res.status(400).json({
      error: 'Invalid request',
      details: parsedRequest.error.flatten()
    });
  }

  const model = getConfigModel(genAI, MODEL_NAME, parsedRequest.data.config);
  if (!model) {
    return res.status(503).json({ error: 'Gemini API key missing' });
  }

  let configurationTree;
  try {
    configurationTree = await buildConfigurationTree(PRODUCT_SERVICE_URL);
  } catch (error) {
    return res.status(503).json({
      error: 'Catalog unavailable',
      details: error.message
    });
  }

  try {
    const prompt = buildConfigPrompt(parsedRequest.data.text, configurationTree);
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const jsonText = extractJson(rawText);
    const parsedJson = JSON.parse(jsonText);

    return res.json({
      ...parsedJson,
      meta: { model: MODEL_NAME }
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to generate configuration',
      details: error.message,
      model: MODEL_NAME
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
  console.log(`  GEMINI_MODEL: ${MODEL_NAME}`);
});
