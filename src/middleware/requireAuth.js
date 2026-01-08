import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
    const auth = req.headers.authorization || "";
    const [type, token] = auth.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({ message: "Missing Bearer token" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.sub, role: payload.role };
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}