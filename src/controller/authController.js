import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  console.log(`🔐 Login attempt: ${email}`);

  if (!email || typeof email !== "string" || !email.trim()) {
    console.log(`❌ Login failed - missing email`);
    return res.status(400).json({ message: "email is required" });
  }
  if (!password || typeof password !== "string" || !password.trim()) {
    console.log(`❌ Login failed - missing password`);
    return res.status(400).json({ message: "password is required" });
  }

  const user = await User.findOne({ where: { email: email.trim() } });
  if (!user) {
    console.log(`❌ Login failed - user not found: ${email}`);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    console.log(`❌ Login failed - invalid password for: ${email}`);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  console.log(`✅ Login successful - User ID: ${user.id}, Role: ${user.role}, Email: ${email}`);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
