// src/routes/adminRoutes.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Option A: protect *all* routes in this router
router.use(requireAuth);
router.use(requireAdmin);

// Example admin-only route
router.get("/dashboard", async (req, res) => {
  // Only authenticated admins reach this
  res.json({
    message: "Welcome, admin!",
    userId: req.user.id,
    role: req.user.role,
  });
});

// Another example
router.get("/users", async (req, res) => {
  // Example: fetch all users (pseudo-code)
  // const users = await User.find();
  const users = []; // replace with real DB call
  res.json(users);
});

export default router;
