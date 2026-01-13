// src/controller/orderController.js
import { sequelize, Order, OrderItem, Product } from "../models/index.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

export const listOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      order: [["id", "ASC"]],
      include: [{ model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }],
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { userId, total, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "items is required and must be a non-empty array" });
    }

    const order = await Order.create(
      {
        user_id: userId ?? null,
        total_price: total ?? 0,   // ← important
      },
      { transaction: t }
    );

    const itemsToCreate = items.map((it) => ({
      order_id: order.id,
      product_id: it.productId,
      quantity: it.quantity ?? 1,
      unit_price: it.price ?? 0,  // ← important
    }));

    await OrderItem.bulkCreate(itemsToCreate, { transaction: t });

    await t.commit();

    const created = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    // Create a Stripe PaymentIntent for the order amount
    const amount = Math.round((Number(total ?? 0) || 0) * 100); // cents
    const currency = process.env.STRIPE_CURRENCY || "sek";

    let clientSecret = null;
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: { order_id: String(order.id) },
      });
      clientSecret = paymentIntent.client_secret;
    } catch (err) {
      // If Stripe creation fails, still return the created order but log error
      console.error("Stripe PaymentIntent create failed:", err.message || err);
    }

    res.status(201).json({ order: created, clientSecret });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

export const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event;
  try {
    // req.body is raw buffer because route uses express.raw
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message || err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object;
      const orderId = pi.metadata?.order_id;
      if (orderId) {
        const order = await Order.findByPk(orderId);
        if (order) {
          console.log(`Payment succeeded for order ${orderId}`);
          // No `status` field on Order model; update as needed if you add one later.
        }
      }
    }

    // acknowledge receipt
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

export const updateOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { userId, total, items } = req.body;

    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    if (userId !== undefined) order.user_id = userId;
    if (total !== undefined) order.total = total;
    await order.save({ transaction: t });

    if (items !== undefined) {
      await OrderItem.destroy({ where: { order_id: order.id }, transaction: t });

      const itemsToCreate = items.map((it) => ({
        order_id: order.id,
        product_id: it.productId,
        quantity: it.quantity ?? 1,
        price: it.price ?? 0,
      }));
      if (itemsToCreate.length > 0) {
        await OrderItem.bulkCreate(itemsToCreate, { transaction: t });
      }
    }

    await t.commit();

    const updated = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }],
    });

    res.json(updated);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

export const deleteOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    await OrderItem.destroy({ where: { order_id: order.id }, transaction: t });
    await order.destroy({ transaction: t });

    await t.commit();
    res.status(204).send();
  } catch (err) {
    await t.rollback();
    next(err);
  }
};