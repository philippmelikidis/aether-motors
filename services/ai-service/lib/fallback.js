// ---------------------------------------------------------------------------
// AI Service – deterministic fallback configurator.
//
// Used when no Gemini API key is configured (`GEMINI_API_KEY` unset) or when
// the upstream model returns an unrecoverable error. The fallback walks the
// configuration tree returned by the product service and picks the *first*
// option in every category, which yields a valid, schema-conforming response
// and lets the demo work end-to-end without external dependencies.
//
// The response is intentionally identical in shape to the live model's
// output; only `meta.fallback === true` signals that no Gemini call was made.
// ---------------------------------------------------------------------------

/**
 * @param {string} userText     – the original user prompt (used in summary)
 * @param {Array}  configurationTree – tree returned by buildConfigurationTree
 * @returns {object} response payload following the live model contract
 */
function buildFallbackConfiguration(userText, configurationTree) {
  const safeTree = Array.isArray(configurationTree) ? configurationTree : [];

  // First vehicle in the catalogue, first option per option-group.
  const firstModel = safeTree[0] || {};
  const modelId = firstModel.id || firstModel.slug || 'project-zenith';
  const modelName = firstModel.name || firstModel.title || modelId;

  const selections = {};
  const reasoning = {};

  const groups = Array.isArray(firstModel.options) ? firstModel.options : [];
  for (const group of groups) {
    const groupKey = group.id || group.slug || group.name;
    const firstChoice =
      Array.isArray(group.choices) && group.choices.length > 0
        ? group.choices[0]
        : null;
    if (!groupKey || !firstChoice) continue;
    const choiceId = firstChoice.id || firstChoice.slug || firstChoice.name;
    if (!choiceId) continue;
    selections[groupKey] = choiceId;
    reasoning[groupKey] = `Default pick: first available "${
      firstChoice.name || choiceId
    }" – no AI model available.`;
  }

  // Guarantee at least one selection so the strict schema still passes.
  if (Object.keys(selections).length === 0) {
    selections.placeholder = 'default';
    reasoning.placeholder =
      'No options present in configuration tree; returning placeholder.';
  }

  const trimmedRequest = (userText || '').slice(0, 140);
  const summary =
    `Deterministic fallback configuration for "${modelName}". ` +
    (trimmedRequest
      ? `Request was: "${trimmedRequest}". `
      : '') +
    'Set GEMINI_API_KEY to enable AI-generated recommendations.';

  return {
    configuration: {
      model: modelId,
      selections,
    },
    reasoning: {
      model: modelId,
      selections: reasoning,
    },
    summary,
  };
}

module.exports = { buildFallbackConfiguration };
