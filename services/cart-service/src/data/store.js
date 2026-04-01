const carts = new Map();

function createCart(cart) {
  carts.set(cart.id, cart);
  return cart;
}

function getCartById(cartId) {
  return carts.get(cartId) || null;
}

function saveCart(cart) {
  cart.updatedAt = new Date().toISOString();
  carts.set(cart.id, cart);
  return cart;
}

module.exports = {
  createCart,
  getCartById,
  saveCart,
};
