import "dotenv/config";
import express from "express";
import cors from "cors";
import sequelize from "./models/sequelize.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(cors());
app.use(express.json());

try {
  await sequelize.authenticate();
  console.log("✅ DB connected successfully");
} catch (err) {
  console.error("❌ DB connection failed:", err);
  process.exit(1);
}

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

app.use(errorHandler);
