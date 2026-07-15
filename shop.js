import { Router } from "express";
import { pool } from "./db.js";
import { requireAuth } from "./auth.js";
import { SHOP_ITEMS } from "./catalog.js";

export const shopRouter = Router();

shopRouter.post("/purchase", requireAuth, async (req, res) => {
  const { item_id, idempotency_key } = req.body;
  const item = SHOP_ITEMS[item_id];
  if (!item) return res.status(400).json({ error: "Unknown item_id" });
  if (!idempotency_key) return res.status(400).json({ error: "idempotency_key is required" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT id FROM shop_purchases WHERE idempotency_key = $1`,
      [idempotency_key]
    );
    if (existing.rows.length) {
      await client.query("ROLLBACK");
      return res.json({ message: "Already purchased", item_id });
    }

    const wallet = await client.query(
      `SELECT gems FROM wallets WHERE user_id = $1 FOR UPDATE`,
      [req.user.user_id]
    );
    if (!wallet.rows.length || wallet.rows[0].gems < item.price) {
      await client.query("ROLLBACK");
      return res.status(402).json({ error: "Insufficient gems" });
    }

    await client.query(`UPDATE wallets SET gems = gems - $1 WHERE user_id = $2`, [
      item.price,
      req.user.user_id,
    ]);
    await client.query(
      `INSERT INTO shop_purchases (user_id, item_id, gems_spent, idempotency_key)
       VALUES ($1, $2, $3, $4)`,
      [req.user.user_id, item_id, item.price, idempotency_key]
    );

    await client.query("COMMIT");
    res.json({ message: `${item.name} unlocked`, item_id });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Purchase error:", e);
    res.status(500).json({ error: "Purchase failed" });
  } finally {
    client.release();
  }
});

shopRouter.get("/owned", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT item_id FROM shop_purchases WHERE user_id = $1`,
      [req.user.user_id]
    );
    res.json({ owned: result.rows.map((r) => r.item_id) });
  } catch (e) {
    console.error("Owned items fetch error:", e);
    res.status(500).json({ error: "Could not load owned items" });
  }
});
