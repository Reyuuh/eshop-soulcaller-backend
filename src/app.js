import "dotenv/config";
import express from "express";
import cors from "cors";
import sequelize from "./models/sequelize.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { requireAdmin } from "./middleware/requireAdmin.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { dbInit } from "./models/dbInit.js";
import usersRoutes from "./routes/usersRoutes.js";


const app = express();
app.use(cors());
app.use(express.json());

try {
  await sequelize.authenticate();
  console.log("✅ DB connected successfully");
  await dbInit();  // Add this to sync the database
} catch (err) {
  console.error("❌ DB connection failed:", err);
  process.exit(1);
}


app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/categories", categoriesRoutes);  // Add this to mount categories routes
app.use("/products", productsRoutes);  // Add this to mount products routes
app.use("/orders", ordersRoutes);      // Add this to mount orders routes


// Optional placeholders (remove later)
app.use("/admins", requireAuth, requireAdmin, (req, res) => {
  res.status(501).json({ message: "Admins routes not implemented yet" });
});
app.use("/users", usersRoutes, (req, res) => {

});

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

