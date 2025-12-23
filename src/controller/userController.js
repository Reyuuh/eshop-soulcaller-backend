// src/controllers/user.controller.js
import { User } from "../models/index.js";

export const listUsers = async (req, res) => {
  const users = await User.findAll({
    order: [["name", "ASC"]],
  });
  res.json(users);
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

export const createUser = async (req, res) => {
  const { email, password, role  } = req.body;
  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ message: "email is required" });
  }
  if (!password || typeof password !== "string" || !password.trim()) {
    return res.status(400).json({ message: "password is required" });
  }

  const created = await User.create({
    email: email.trim(),
    password: password,
    role: role || "user",
  });

  res.status(201).json(created);
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, password } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Only update fields that are provided
  if (email !== undefined) {
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "email must be a non-empty string" });
    }
    user.email = email.trim();
  }

  if (password !== undefined) {
    user.password = password;
  }
    await user.save();
    res.json(user);
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // If products reference this category, MySQL will block delete (RESTRICT) → handled by errorHandler
  await user.destroy();
  res.status(204).send();
};
