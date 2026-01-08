// src/controllers/adminController.js
import bcrypt from "bcrypt";
import { Admin } from "../models/index.js";

export const listAdmins = async (req, res) => {
const admins = await Admin.findAll({
  where: { role: "admin" },
  attributes: { exclude: ["password"] },
  order: [["email", "ASC"]],
});
  res.json(admins);
};

export const getAdminById = async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findByPk(id, {
    attributes: { exclude: ["password"] },
    });
    if (!admin || admin.role !== "admin") {
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
  if (role !== "admin") {
    return res.status(400).json({ message: "role must be 'admin'" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const created = await Admin.create({
    email: email.trim(),
    password: passwordHash,
    role: "admin",
  });

  const { password: _pw, ...safe } = created.toJSON();
  res.status(201).json(safe);
};

export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { email, password, role } = req.body;
    const admin = await Admin.findByPk(id);
if (!admin || admin.role !== "admin") {
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
  if (role !== "admin") {
    return res.status(400).json({ message: "role must be 'admin'" });
   }
  admin.role = "admin";
   }

    await admin.save();
    const { password: _pw, ...safe } = admin.toJSON();
    res.json(safe);

};

export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
    const admin = await Admin.findByPk(id);
    if (!admin || admin.role !== "admin") {
  return res.status(404).json({ message: "Admin not found" });
}
    await admin.destroy();
    res.status(204).send();
};
