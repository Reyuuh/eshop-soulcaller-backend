import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe"; // ⬅️ ADD THIS
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

// ⬅️ INIT STRIPE WITH YOUR SECRET KEY
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

try {
  await sequelize.authenticate();
  console.log("✅ DB connected successfully");
  await dbInit();
} catch (err) {
  console.error("❌ DB connection failed:", err);
  process.exit(1);
}

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/categories", categoriesRoutes);
app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/users", usersRoutes);

// OPTIONAL admin-protected variants
app.use("/categories", requireAuth, requireAdmin, categoriesRoutes);
app.use("/products", requireAuth, requireAdmin, productsRoutes);

// 🔥 STRIPE PAYMENT ROUTE USED BY YOUR PaymentForm
app.post("/payment/process", async (req, res) => {
  const { paymentMethodId, amount, name, email, address } = req.body;

  if (!paymentMethodId || !amount) {
    return res.status(400).json({
      success: false,
      message: "paymentMethodId and amount are required",
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,                  // 1000 = 10.00 kr
      currency: "sek",
      payment_method: paymentMethodId,
      confirmation_method: "automatic",
      confirm: true,
      receipt_email: email,
      description: `Order by ${name || "Unknown"}`,
      shipping: {
        name: name || "Unknown",
        address: {
          line1: address || "Unknown address",
        },
      },
    });

    if (paymentIntent.status === "succeeded") {
      return res.json({
        success: true,
        message: "Payment successful",
        paymentIntentId: paymentIntent.id,
      });
    }

    return res.status(400).json({
      success: false,
      message: `Unexpected payment status: ${paymentIntent.status}`,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
