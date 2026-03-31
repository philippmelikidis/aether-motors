const prefixCounter = new Map();

function nextId(prefix) {
  const current = prefixCounter.get(prefix) || 0;
  const next = current + 1;
  prefixCounter.set(prefix, next);
  return `${prefix}_${next}`;
}

module.exports = { nextId };
