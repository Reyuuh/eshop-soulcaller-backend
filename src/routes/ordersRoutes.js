// src/routes/orders.routes.js
import { Router } from "express";
import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  listOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  handleStripeWebhook,
} from "../controller/ordersController.js";

const router = Router();

router.get("/", asyncHandler(listOrders));
router.get("/:id", asyncHandler(getOrderById));
router.post("/", asyncHandler(createOrder));
// Stripe webhook endpoint (uses raw body)
router.post("/webhook", express.raw({ type: "application/json" }), asyncHandler(handleStripeWebhook));
router.put("/:id", asyncHandler(updateOrder));
router.delete("/:id", asyncHandler(deleteOrder));

export default router;
