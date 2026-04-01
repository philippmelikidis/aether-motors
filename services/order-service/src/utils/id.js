let orderCounter = 0;

function nextOrderId() {
  orderCounter += 1;
  return `order_${orderCounter}`;
}

module.exports = { nextOrderId };
