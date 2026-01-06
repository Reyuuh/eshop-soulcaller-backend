// src/controller/orderController.js
import { sequelize, Order, OrderItem, Product } from "../models/index.js";

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
      return res.status(400).json({ message: "items is required and must be a non-empty array" });
    }

    const order = await Order.create(
      { user_id: userId ?? null, total: total ?? 0 },
      { transaction: t }
    );

    const itemsToCreate = items.map((it) => ({
      order_id: order.id,
      product_id: it.productId,
      quantity: it.quantity ?? 1,
      price: it.price ?? 0,
    }));

    await OrderItem.bulkCreate(itemsToCreate, { transaction: t });

    await t.commit();

    const created = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }],
    });

    res.status(201).json(created);
  } catch (err) {
    await t.rollback();
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