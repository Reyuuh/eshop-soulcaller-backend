// src/controllers/categories.controller.js
import { Category } from "../models/index.js";

export const listCategories = async (req, res) => {
  const categories = await Category.findAll({
    order: [["name", "ASC"]],
  });
  res.json(categories);
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.json(category);
};

export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "name is required" });
  }

  const created = await Category.create({
    name: name.trim(),
    description: description ?? null,
  });

  res.status(201).json(created);
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const category = await Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Only update fields that are provided
  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "name must be a non-empty string" });
    }
    category.name = name.trim();
  }

  if (description !== undefined) {
    category.description = description;
  }

  await category.save();
  res.json(category);
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // If products reference this category, MySQL will block delete (RESTRICT) → handled by errorHandler
  await category.destroy();
  res.status(204).send();
};
