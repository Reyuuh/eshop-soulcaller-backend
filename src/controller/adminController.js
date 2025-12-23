// src/controllers/admin.controller.js
import { Admin } from "../models/index.js";

export const listAdmins = async (req, res) => {
  const admins = await Admin.findAll({
    order: [["name", "ASC"]],
  });
  res.json(admins);
}

export const getAdminById = async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  };

export const createAdmin = async (req, res) => {
  const { email, password, role } = req.body;
    if (!email || typeof email !== "string" || !email.trim()) {
        return res.status(400).json({ message: "email is required" });
    }
    if (!password || typeof password !== "string" || !password.trim()) {
        return res.status(400).json({ message: "password is required" });
    }   
    if (!role || typeof role !== "admin" || !role.trim()) {
        return res.status(400).json({ message: "admin role is required" });
    }
    const created = await Admin.create({
        email: email.trim(),
        password: password,
        role: role.trim(),
    });
    res.status(201).json(created);
};

export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { email, password, role } = req.body;
    const admin = await Admin.findByPk(id);
    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }
    if (email !== undefined) {
        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ message: "email must be a non-empty string" });
        }
        admin.email = email.trim();
    }
    if (password !== undefined) {
        admin.password = password;
    }
    if (role !== undefined) {
        if (typeof role !== "string" || !role.trim()) {
            return res.status(400).json({ message: "role must be a non-empty string" });
        }
        admin.role = role.trim();
    }
    await admin.save();
    res.json(admin);
};

export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
    const admin = await Admin.findByPk(id);
    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }
    await admin.destroy();
    res.status(204).send();
};
