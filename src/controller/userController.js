// src/controllers/userController.js
import bcrypt from "bcrypt";
import { User } from "../models/index.js";

export const listUsers = async (req, res) => {
  const users = await User.findAll({
    where: { role: "user" },
    attributes: { exclude: ["password"] },
    order: [["email", "ASC"]],
  });
  res.json(users);
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id , {
    attributes: { exclude: ["password"] },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

export const createUser = async (req, res) => {
  console.log("📥 Received body:", req.body);
  const { name, email, password, role } = req.body;
  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }
  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ message: "email is required" });
  }
  if (!password || typeof password !== "string" || !password.trim()) {
    return res.status(400).json({ message: "password is required" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Standardvärde är "user" om ingen roll anges, annars använd den skickade rollen
  const userRole = role && ["user", "admin"].includes(role) ? role : "user";

  const created = await User.create({
    name: name?.trim() || null, 
    email: email.trim(),
    password: passwordHash,
    role: userRole,
  });
  const { password: _pw, ...safe } = created.toJSON();
  res.status(201).json(safe);
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
    const { password: _pw, ...safe } = user.toJSON();
    res.json(safe);
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
