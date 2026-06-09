function buildConfigPrompt(userText, tree) {
  const treeJson = JSON.stringify(tree);

  console.log(treeJson);

  return [
    'You are an automotive configuration assistant for Aether Motors.',
    'Return ONLY valid JSON that matches this schema:',
    '{"configuration":{"model":"...","selections":{"<category>":"<optionSlug>"}},"reasoning":{"model":"...","selections":{"<category>":"<shortReason>"}},"summary":"..."}',
    'Use ONLY option slugs listed in the catalog below for the selected model.',
    'CRITICAL COMPLETENESS RULE:',
    'In the catalog, each model has an "options" object whose keys are the categories (e.g. colors, wheels, interiors, suspensions, exhausts).',
    'A category is "available" only if its array in the selected model\'s "options" is NON-EMPTY.',
    'configuration.selections MUST contain EXACTLY ONE entry for EVERY available (non-empty) category, and NOTHING for empty categories.',
    'Never omit an available category, even if the user did not mention it — pick the most fitting option yourself.',
    'Never invent a slug: only use slugs that actually appear in that category\'s array. If a category\'s array is empty, do not include that category at all.',
    'reasoning.selections MUST use the exact same set of keys as configuration.selections, with a short reason for each.',
    'Before you answer, verify that configuration.selections has one entry for each non-empty category of the selected model. If an available category is missing, add it.',
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
