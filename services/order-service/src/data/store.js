const orders = new Map();

function createOrder(order) {
  orders.set(order.id, order);
  return order;
}

function getOrderById(orderId) {
  return orders.get(orderId) || null;
}

function getAllOrders() {
  return Array.from(orders.values());
}

function saveOrder(order) {
  order.updatedAt = new Date().toISOString();
  orders.set(order.id, order);
  return order;
}

function deleteOrder(orderId) {
  return orders.delete(orderId);
}

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  saveOrder,
  deleteOrder,
};
