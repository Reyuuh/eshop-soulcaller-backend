// src/controllers/products.controller.js
import { Product } from "../models/index.js";

export const listProducts = async (req, res) => {
  const products = await Product.findAll({
    order: [["name", "ASC"]],
  });
  res.json(products);
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByPk(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};

export const createProduct = async (req, res) => {
  const { name, description, price, img_url, category_id } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "name is required" });
  }

  const created = await Product.create({
    name: name.trim(),
    description: description ?? null,
    price: price ?? null,
    img_url: img_url ?? null,
    category_id: category_id ?? null,
  });

  res.status(201).json(created);
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, img_url, category_id } = req.body;

  const product = await Product.findByPk(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Only update fields that are provided
  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "name must be a non-empty string" });
    }
    product.name = name.trim();
  }

  if (description !== undefined) {
    product.description = description;
  }

  if (price !== undefined) {
    product.price = price;
  }

  if (img_url !== undefined) {
    product.img_url = img_url;
  }

  if (category_id !== undefined) {
    product.category_id = category_id;
  }

  await product.save();
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByPk(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // If products reference this category, MySQL will block delete (RESTRICT) → handled by errorHandler
  await product.destroy();
  res.status(204).send();
};
