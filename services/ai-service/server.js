const express = require('express');
const dotenv = require('dotenv');
const { requestSchema } = require('./lib/schemas');
const { createGeminiClient, getConfigModel } = require('./lib/gemini');
const { buildConfigurationTree } = require('./lib/product-service');
const { buildConfigPrompt, extractJson } = require('./lib/prompt');
const { buildFallbackConfiguration } = require('./lib/fallback');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

app.use(express.json());

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

// Endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-service',
    aiEnabled,
    mode: aiEnabled ? 'gemini' : 'fallback',
  });
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
      details: parsedRequest.error.flatten(),
    });
  }

  let configurationTree;
  try {
    configurationTree = await buildConfigurationTree(PRODUCT_SERVICE_URL);
  } catch (error) {
    return res.status(503).json({
      error: 'Catalog unavailable',
      details: error.message,
    });
  }

  // If the API key isn't configured, serve a deterministic fallback rather
  // than failing the demo. The response is schema-identical to the live
  // model's, only `meta.fallback` is added to signal the source.
  const model = getConfigModel(genAI, MODEL_NAME, parsedRequest.data.config);
  if (!model) {
    const fallback = buildFallbackConfiguration(
      parsedRequest.data.text,
      configurationTree
    );
    return res.json({
      ...fallback,
      meta: {
        model: 'fallback',
        fallback: true,
        reason: 'gemini_api_key_missing',
      },
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
      meta: { model: MODEL_NAME, fallback: false },
    });
  } catch (error) {
    // Live model errored – still useful to keep the UI working with a
    // deterministic answer, but surface that an error happened.
    console.warn('[ai-service] Gemini call failed, serving fallback:', error.message);
    const fallback = buildFallbackConfiguration(
      parsedRequest.data.text,
      configurationTree
    );
    return res.json({
      ...fallback,
      meta: {
        model: 'fallback',
        fallback: true,
        reason: 'gemini_call_failed',
        upstreamError: error.message,
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
  console.log(`  GEMINI_MODEL: ${MODEL_NAME}`);
  console.log(`  AI enabled:   ${aiEnabled}`);
});
