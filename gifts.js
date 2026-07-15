import { Router } from "express";
import { pool } from "./db.js";
import { requireAuth } from "./auth.js";
import { SHOP_ITEMS } from "./catalog.js";

export const giftsRouter = Router();

giftsRouter.post("/send", requireAuth, async (req, res) => {
  const { item_id, to_user_id, to_email } = req.body;
  if (!SHOP_ITEMS[item_id]) return res.status(400).json({ error: "Unknown item_id" });
  if (!to_user_id && !to_email) {
    return res.status(400).json({ error: "to_user_id or to_email is required" });
  }

  try {
    const owned = await pool.query(
      `SELECT id FROM shop_purchases WHERE user_id = $1 AND item_id = $2`,
      [req.user.user_id, item_id]
    );
    if (!owned.rows.length) {
      return res.status(403).json({ error: "You don't own this item" });
    }

    const recipient = to_email
      ? await pool.query(`SELECT id, display_name FROM users WHERE email = $1`, [
          to_email.toLowerCase().trim(),
        ])
      : await pool.query(`SELECT id, display_name FROM users WHERE id = $1`, [to_user_id]);

    if (!recipient.rows.length) {
      return res.status(404).json({ error: "No GLITCH account found with that email" });
    }
    const recipientId = recipient.rows[0].id;

    if (recipientId === req.user.user_id) {
      return res.status(400).json({ error: "Cannot gift an item to yourself" });
    }

    await pool.query(
      `INSERT INTO gift_transfers (item_id, from_user_id, to_user_id, status)
       VALUES ($1, $2, $3, 'sent')`,
      [item_id, req.user.user_id, recipientId]
    );

    res.json({ message: `${SHOP_ITEMS[item_id].name} sent to ${recipient.rows[0].display_name}` });
  } catch (e) {
    console.error("Gift send error:", e);
    res.status(500).json({ error: "Could not send gift" });
  }
});

giftsRouter.get("/received", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gt.id, gt.item_id, gt.status, gt.created_at, u.display_name AS from_name
       FROM gift_transfers gt
       JOIN users u ON u.id = gt.from_user_id
       WHERE gt.to_user_id = $1
       ORDER BY gt.created_at DESC`,
      [req.user.user_id]
    );
    res.json({ gifts: result.rows });
  } catch (e) {
    console.error("Gifts fetch error:", e);
    res.status(500).json({ error: "Could not load gifts" });
  }
});
