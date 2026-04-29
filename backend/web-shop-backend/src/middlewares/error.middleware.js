function errorMiddleware(error, req, res, next) {
  console.error("Error in web-shop-backend:");
  console.error(error);

  const statusCode = error.response?.status || error.status || 500;

  res.status(statusCode).json({
    error: "Internal Server Error",
    message: error.message || "An unknown error occurred",
    serviceError: error.response?.data || null
  });
}

module.exports = errorMiddleware;