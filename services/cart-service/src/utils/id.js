const crypto = require('crypto');

function nextId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

module.exports = { nextId };
