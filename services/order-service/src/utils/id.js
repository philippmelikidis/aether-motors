const crypto = require('crypto');

let orderCounter = 0;

// Returns IDs like: AM-2026-04F9X1
//   AM   = Aether Motors
//   2026 = current year
//   6-char base32 suffix (counter + random salt) — readable, unambiguous
function nextOrderId() {
  orderCounter += 1;
  const year = new Date().getFullYear();
  const counterPart = orderCounter.toString(36).toUpperCase().padStart(3, '0');
  const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `AM-${year}-${counterPart}${randomPart}`;
}

module.exports = { nextOrderId };
