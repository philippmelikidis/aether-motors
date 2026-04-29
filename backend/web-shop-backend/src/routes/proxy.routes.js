const express = require("express");
const axios = require("axios");

const {
  productServiceUrl,
  cartServiceUrl,
  orderServiceUrl,
  mediaServiceUrl,
  routeServiceUrl,
  aiServiceUrl
} = require("../config/services");

const router = express.Router();

async function proxyRequest(req, res, targetBaseUrl) {
  const targetUrl = `${targetBaseUrl}${req.originalUrl}`;

  console.log("WEB-SHOP-BACKEND PROXY HIT:");
  console.log(`${req.method} ${req.originalUrl}`);
  console.log(`Forwarding to: ${targetUrl}`);

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      params: req.query,
      data: req.body,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json"
      },
      timeout: 8000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      console.error(`Downstream error from ${targetUrl}:`, error.response.status);
      return res.status(error.response.status).json(error.response.data);
    }

    console.error(`Proxy error to ${targetUrl}:`, error.message);

    return res.status(502).json({
      error: "Bad Gateway",
      message: error.message,
      targetUrl
    });
  }
}

router.all("/api/products*", (req, res) => {
  proxyRequest(req, res, productServiceUrl);
});

router.all("/api/cart*", (req, res) => {
  proxyRequest(req, res, cartServiceUrl);
});

router.all("/api/orders*", (req, res) => {
  proxyRequest(req, res, orderServiceUrl);
});

router.all("/api/media*", (req, res) => {
  proxyRequest(req, res, mediaServiceUrl);
});

router.all("/api/route*", (req, res) => {
  proxyRequest(req, res, routeServiceUrl);
});

router.all("/api/ai*", (req, res) => {
  proxyRequest(req, res, aiServiceUrl);
});

module.exports = router;