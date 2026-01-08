import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ message: "email is required" });
  }
  if (!password || typeof password !== "string" || !password.trim()) {
    return res.status(400).json({ message: "password is required" });
  }

    const user = await User.findOne({ where: { email: email.trim() } });
    if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

    const token = jwt.sign(
        { sub: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );

    res.json({ token });
};