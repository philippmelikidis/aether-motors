function buildConfigPrompt(userText, tree) {
  const treeJson = JSON.stringify(tree);

  return [
    'You are an automotive configuration assistant for Aether Motors.',
    'Return ONLY valid JSON that matches this schema:',
    '{"configuration":{"model":"...","selections":{"<category>":"<optionSlug>"}},"reasoning":{"model":"...","selections":{"<category>":"<shortReason>"}},"summary":"..."}',
    'For every selection, include a short reason in reasoning.selections with the same keys.',
    'Use ONLY option slugs listed in the catalog below for the selected model.',
    'Provide one selection per available category for that model.',
    'Option catalog (JSON):',
    treeJson,
    'User request:',
    userText,
  ].join('\n');
}

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    return trimmed;
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('No JSON object found in model response');
  }

  return match[0];
}

module.exports = {
  buildConfigPrompt,
  extractJson,
};
