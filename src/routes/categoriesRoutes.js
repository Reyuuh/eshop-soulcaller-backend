// src/routes/categories.routes.js
import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controller/categoriesController.js";

const router = Router();

router.get("/", asyncHandler(listCategories));
router.get("/:id", asyncHandler(getCategoryById));
router.post("/", asyncHandler(createCategory));
router.put("/:id", asyncHandler(updateCategory));
router.delete("/:id", asyncHandler(deleteCategory));

export default router;
