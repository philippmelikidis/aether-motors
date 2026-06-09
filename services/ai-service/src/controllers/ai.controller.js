const { requestSchema } = require('../validation/schemas');
const { getConfigModel } = require('../integrations/gemini');
const { buildConfigurationTree } = require('../integrations/product-service');
const { buildConfigPrompt, extractJson } = require('../utils/prompt');
const { genAI, aiEnabled, MODEL_NAME, PRODUCT_SERVICE_URL } = require('../config');

function health(req, res) {
  res.json({
    status: 'healthy',
    service: 'ai-service',
    aiEnabled,
    mode: aiEnabled ? 'gemini' : 'disabled',
  });
}

async function getOptions(req, res) {
  try {
    const tree = await buildConfigurationTree(PRODUCT_SERVICE_URL);
    res.json({ options: tree });
  } catch (error) {
    res.status(503).json({ error: 'Catalog unavailable', details: error.message });
  }
}

async function configure(req, res) {
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

  // Without a configured API key there is no model to call – fail explicitly.
  const model = getConfigModel(genAI, MODEL_NAME, parsedRequest.data.config);
  if (!model) {
    return res.status(503).json({
      error: 'AI service unavailable',
      details: 'GEMINI_API_KEY is not configured',
      reason: 'gemini_api_key_missing',
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
      meta: { model: MODEL_NAME },
    });
  } catch (error) {
    console.warn('[ai-service] Gemini call failed:', error.message);
    return res.status(502).json({
      error: 'AI generation failed',
      details: error.message,
      reason: 'gemini_call_failed',
    });
  }
}

module.exports = {
  health,
  getOptions,
  configure,
};
