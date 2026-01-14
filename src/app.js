import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe";

import { sequelize, Order, OrderItem } from "./models/index.js";
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
  const {
    paymentMethodId,
    amount,
    name,
    email,
    address,
    cartItems,
    userId,
  } = req.body;

  if (!paymentMethodId || !amount || !cartItems || !userId) {
    return res.status(400).json({
      success: false,
      message: "paymentMethodId, amount, cartItems and userId are required",
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
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

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: `Unexpected payment status: ${paymentIntent.status}`,
      });
    }

    const totalPrice = amount / 100;

    const t = await sequelize.transaction();

    try {
      const order = await Order.create(
        {
          user_id: userId,
          total_price: totalPrice,
          order_date: new Date(),
        },
        { transaction: t }
      );

      for (const item of cartItems) {
        await OrderItem.create(
          {
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
          },
          { transaction: t }
        );
      }

      await t.commit();

      return res.json({
        success: true,
        message: "Payment successful & order saved",
        paymentIntentId: paymentIntent.id,
        orderId: order.id,
      });
    } catch (dbErr) {
      await t.rollback();
      console.error("DB error while saving order:", dbErr);
      return res.status(500).json({
        success: false,
        message: "Payment succeeded but order saving failed",
      });
    }
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
