import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";

export const authRouter = Router();

function signToken(user) {
  return jwt.sign(
    { user_id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing auth token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

authRouter.post("/register", async (req, res) => {
  const { email, password, display_name } = req.body;
  if (!email || !password || password.length < 8) {
    return res
      .status(400)
      .json({ error: "email and a password of at least 8 characters are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name`,
      [email.toLowerCase().trim(), passwordHash, display_name || email.split("@")[0]]
    );
    const user = userResult.rows[0];

    // Starting balance — adjust or drop entirely for a real launch.
    await client.query(
      `INSERT INTO wallets (user_id, gems, coins) VALUES ($1, $2, $3)`,
      [user.id, 0, 0]
    );

    await client.query("COMMIT");
    res.status(201).json({ token: signToken(user), user });
  } catch (e) {
    await client.query("ROLLBACK");
    if (e.code === "23505") {
      return res.status(409).json({ error: "An account with that email already exists" });
    }
    console.error("Register error:", e);
    res.status(500).json({ error: "Registration failed" });
  } finally {
    client.release();
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, display_name, password_hash FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];
    // Constant-shape response whether the email exists or not, to avoid
    // leaking which emails are registered.
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    delete user.password_hash;
    res.json({ token: signToken(user), user });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ error: "Login failed" });
  }
});
