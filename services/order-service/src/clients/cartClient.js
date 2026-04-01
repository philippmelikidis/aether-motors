async function getCart(cartId) {
  const baseUrl = process.env.CART_SERVICE_URL || 'http://cart-service:3001';
  const response = await fetch(`${baseUrl}/api/cart/${cartId}`);

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return payload.data || null;
}

module.exports = { getCart };
