const mockProducts = require('../data/mockProducts');

async function getProductFromExternalService(productId) {
  const productServiceUrl = process.env.PRODUCT_SERVICE_URL;

  if (!productServiceUrl) {
    return null;
  }

  const response = await fetch(`${productServiceUrl}/api/products/${productId}`);
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return payload.data || null;
}

function getProductFromMock(productId) {
  return mockProducts.find((product) => product.id === productId) || null;
}

async function getProductById(productId) {
  try {
    const externalProduct = await getProductFromExternalService(productId);
    if (externalProduct) {
      return externalProduct;
    }
  } catch (err) {
    // Fallback auf Mockdaten
  }

  const useMockProducts = process.env.USE_MOCK_PRODUCTS !== 'false';
  if (useMockProducts) {
    return getProductFromMock(productId);
  }

  return null;
}

module.exports = { getProductById };
