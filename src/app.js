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

// ✅ frontend URL for redirects + CORS
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ✅ CORS: avoid localhost vs 127.0.0.1 mismatch
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  CLIENT_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow Postman etc.
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

/**
 * ✅ STRIPE WEBHOOK (must be BEFORE express.json)
 * Needs raw body for signature verification.
 */
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const orderId = session.metadata?.orderId;
        const userId = session.metadata?.userId;

        console.log("✅ checkout.session.completed", {
          sessionId: session.id,
          orderId,
          userId,
          amount_total: session.amount_total,
          currency: session.currency,
        });

        // TODO (important): Save/mark order paid here.
        // Recommended approach:
        // 1) Create a pending order in /create-checkout-session and store orderId in session.metadata
        // 2) On this webhook event, update that order status to "paid"
        //
        // Example (if you add fields to Order):
        // await Order.update(
        //   { status: "paid", stripe_session_id: session.id },
        //   { where: { id: orderId } }
        // );
      }

      return res.json({ received: true });
    } catch (err) {
      console.error("Webhook handler error:", err);
      return res.status(500).send("Webhook handler failed");
    }
  }
);

// ✅ JSON parsing for all normal routes AFTER webhook
app.use(express.json());

/** DB init (unchanged) */
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

/** Routes (unchanged) */
app.use("/auth", authRoutes);
app.use("/categories", categoriesRoutes);
app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/users", usersRoutes);

// OPTIONAL admin-protected variants (unchanged)
app.use("/categories", requireAuth, requireAdmin, categoriesRoutes);
app.use("/products", requireAuth, requireAdmin, productsRoutes);

/**
 * ✅ NEW: Stripe Checkout Session (standard Stripe hosted page)
 * Called from your StripeCheckoutButton in frontend.
 *
 * Note: Your Stripe account API version rejected "automatic_payment_methods",
 * so we use payment_method_types: ["card"].
 */
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, userId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    // ✅ TEMP: Create a placeholder orderId.
    // Recommended: create a pending Order in DB here and use its real ID.
    // const order = await Order.create({ user_id: userId, total_price: 0, order_date: new Date() });
    // const orderId = order.id;
    const orderId = "123";

    const lineItems = items.map((item) => {
      const price =
        typeof item.price === "string" ? parseFloat(item.price) : item.price;

      return {
        quantity: Number(item.quantity) || 1,
        price_data: {
          currency: "sek",
          product_data: { name: String(item.name || "Item") },
          unit_amount: Math.round(Number(price) * 100),
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,

      // ✅ Works with your Stripe API version:
      payment_method_types: ["card"],

      billing_address_collection: "required",

      success_url: `${CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/payment`,

      metadata: {
        orderId: String(orderId),
        userId: userId ? String(userId) : "",
      },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return res.status(500).json({ message: err.message || "Failed to create checkout session." });
  }
});

// 🔥 STRIPE PAYMENT ROUTE USED BY YOUR OLD PaymentForm (unchanged)
app.post("/payment/process", async (req, res) => {
  const { paymentMethodId, amount, name, email, address, cartItems, userId } =
    req.body;

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
