async function getCart(cartId) {
  const baseUrl = process.env.CART_SERVICE_URL || 'http://cart-service:3002';
  try {
    const response = await fetch(`${baseUrl}/api/cart/${cartId}`);
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    return payload.data || null;
  } catch (err) {
    console.warn('[order-service] cart lookup failed:', err.message);
    return null;
  }
}

module.exports = { getCart };
