import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controller/userController.js";
import { login } from "../controller/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.post("/", asyncHandler(createUser));
router.post("/login", asyncHandler(login));

router.get("/", requireAuth, requireAdmin, asyncHandler(listUsers));
router.get("/:id", requireAuth, asyncHandler(getUserById));
router.put("/:id", requireAuth, asyncHandler(updateUser));
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(deleteUser));

export default router;
