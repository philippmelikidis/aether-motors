const express = require("express");

const ensureCart = require("../middlewares/ensureCart.middleware");
const asyncHandler = require("../utils/asyncHandler");
const cartController = require("../controllers/cart.controller");

const router = express.Router();

router.get("/cart", ensureCart, asyncHandler(cartController.showCart));

router.post("/cart/items", ensureCart, asyncHandler(cartController.addCartItem));

router.post(
  "/cart/items/:itemId/update",
  ensureCart,
  asyncHandler(cartController.updateCartItem)
);

router.post(
  "/cart/items/:itemId/remove",
  ensureCart,
  asyncHandler(cartController.removeCartItem)
);

router.post("/cart/clear", ensureCart, asyncHandler(cartController.clearCart));

module.exports = router;