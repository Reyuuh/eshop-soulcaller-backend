import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controller/userController.js"; 


const router = Router();

router.get("/", asyncHandler(listUsers));
router.get("/:id", asyncHandler(getUserById));
router.post("/",asyncHandler(createUser));
router.put("/:id", asyncHandler(updateUser));
router.delete("/:id", asyncHandler(deleteUser));

export default router;
