const express = require("express");

const asyncHandler = require("../utils/asyncHandler");
const checkoutController = require("../controllers/checkout.controller");

const router = express.Router();

router.post("/checkout", asyncHandler(checkoutController.createCheckout));

router.get(
  "/checkout/success/:orderId",
  asyncHandler(checkoutController.showCheckoutSuccess)
);

module.exports = router;