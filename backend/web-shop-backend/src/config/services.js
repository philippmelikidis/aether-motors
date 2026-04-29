module.exports = {
  productServiceUrl: process.env.PRODUCT_SERVICE_URL || "http://localhost:3001",
  cartServiceUrl: process.env.CART_SERVICE_URL || "http://localhost:3002",
  orderServiceUrl: process.env.ORDER_SERVICE_URL || "http://localhost:3003",
  mediaServiceUrl: process.env.MEDIA_SERVICE_URL || "http://localhost:3004",
  routeServiceUrl: process.env.ROUTE_SERVICE_URL || "http://localhost:3005",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:3006"
};