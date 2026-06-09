const { requestSchema } = require('../validation/schemas');
const { getConfigModel } = require('../integrations/gemini');
const { buildConfigurationTree } = require('../integrations/product-service');
const { buildConfigPrompt, extractJson } = require('../utils/prompt');
const { buildFallbackConfiguration } = require('../services/fallback');
const { genAI, aiEnabled, MODEL_NAME, PRODUCT_SERVICE_URL } = require('../config');

function health(req, res) {
  res.json({
    status: 'healthy',
    service: 'ai-service',
    aiEnabled,
    mode: aiEnabled ? 'gemini' : 'fallback',
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
}

module.exports = {
  health,
  getOptions,
  configure,
};
