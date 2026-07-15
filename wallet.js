import { Router } from "express";
import { pool } from "./db.js";
import { requireAuth } from "./auth.js";

export const walletRouter = Router();

walletRouter.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gems, coins FROM wallets WHERE user_id = $1`,
      [req.user.user_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Wallet not found" });
    res.json(result.rows[0]);
  } catch (e) {
    console.error("Wallet fetch error:", e);
    res.status(500).json({ error: "Could not load wallet" });
  }
});
