// src/routes/products.routes.js
import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/productsController.js"; 

const router = Router();

router.get("/", asyncHandler(listProducts));
router.get("/:id", asyncHandler(getProductById));
router.post("/", asyncHandler(createProduct));
router.put("/:id", asyncHandler(updateProduct));
router.delete("/:id", asyncHandler(deleteProduct));

export default router;
