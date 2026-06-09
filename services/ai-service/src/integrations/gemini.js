const { GoogleGenerativeAI } = require('@google/generative-ai');

function createGeminiClient(apiKey) {
  return apiKey ? new GoogleGenerativeAI(apiKey) : null;
}

function getConfigModel(genAI, modelName, overrides = {}) {
  if (!genAI) {
    return null;
  }

  // Documentation: https://ai.google.dev/api/models?hl=de#method:-models.get
  const generationConfig = {
    temperature: 0.2,
    topP: 0.9,
    maxOutputTokens: 512,
    responseMimeType: 'application/json',
  };

  return genAI.getGenerativeModel({ model: modelName, generationConfig });
}

module.exports = {
  createGeminiClient,
  getConfigModel,
};
