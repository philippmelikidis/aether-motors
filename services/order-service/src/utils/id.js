const crypto = require('crypto');

// Returns IDs like: AM-2026-A3F9B1C2
//   AM   = Aether Motors
//   2026 = current year
//   8-char random hex suffix — unique across restarts
function nextOrderId() {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `AM-${year}-${randomPart}`;
}

module.exports = { nextOrderId };
