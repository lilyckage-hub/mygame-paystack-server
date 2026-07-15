import { Router } from "express";
import axios from "axios";
import { pool } from "./db.js";
import { requireAuth } from "./auth.js";
import { PACKS } from "./catalog.js";
import { creditGemsOnce } from "./webhooks.js";

export const depositsRouter = Router();

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

const MOBILE_MONEY_PROVIDERS = new Set([
  "mtn",
  "atl",
  "vod",
  "mpesa",
  "mptill",
  "orange",
  "wave",
]);

depositsRouter.post("/initiate", requireAuth, async (req, res) => {
  const { pack_id, provider, phone, momo_provider, idempotency_key } = req.body;

  const pack = PACKS[pack_id];
  if (!pack) return res.status(400).json({ error: "Unknown pack_id" });
  if (!idempotency_key) return res.status(400).json({ error: "idempotency_key is required" });
  if (!["mobilemoney", "card"].includes(provider)) {
    return res.status(400).json({ error: "provider must be 'mobilemoney' or 'card'" });
  }
  if (provider === "mobilemoney") {
    if (!phone) return res.status(400).json({ error: "phone is required for mobile money" });
    if (!MOBILE_MONEY_PROVIDERS.has(momo_provider)) {
      return res.status(400).json({ error: "Unknown or missing momo_provider" });
    }
  }

  try {
    // Idempotency: if this key was already used, return the existing
    // transaction instead of creating (and charging) a second one.
    const existing = await pool.query(
      `SELECT id, status, gems_amount FROM deposit_transactions WHERE idempotency_key = $1`,
      [idempotency_key]
    );
    if (existing.rows.length) {
      const tx = existing.rows[0];
      return res.json({ transaction_id: tx.id, status: tx.status });
    }

    const email = req.user.email;

    await pool.query(
      `INSERT INTO deposit_transactions
         (id, user_id, pack_id, gems_amount, fiat_amount, currency, provider, status, idempotency_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)`,
      [
        idempotency_key,
        req.user.user_id,
        pack_id,
        pack.gems,
        pack.fiatDisplay,
        pack.currency,
        provider,
        idempotency_key,
      ]
    );
    const transactionId = idempotency_key;

    if (provider === "mobilemoney") {
      const { data } = await paystack.post("/charge", {
        email,
        amount: pack.ghsKobo,
        currency: pack.currency,
        reference: transactionId,
        mobile_money: { phone: phone.replace(/\D/g, ""), provider: momo_provider },
      });

      if (!data.status) {
        await markFailed(transactionId);
        return res.status(402).json({ error: data.message || "Charge could not be started" });
      }

      await pool.query(
        `UPDATE deposit_transactions SET provider_ref = $1 WHERE id = $2`,
        [data.data.reference, transactionId]
      );

      return res.json({
        transaction_id: transactionId,
        status: "pending",
        provider_action: "await_push",
        display_text: data.data.display_text || "Check your phone to authorize this payment.",
        expires_at: new Date(Date.now() + 180_000).toISOString(),
      });
    }

    // Card / other channels: hosted checkout redirect.
    const { data } = await paystack.post("/transaction/initialize", {
      email,
      amount: pack.ghsKobo,
      currency: pack.currency,
      reference: transactionId,
      channels: ["card"],
    });

    if (!data.status) {
      await markFailed(transactionId);
      return res.status(402).json({ error: data.message || "Could not start checkout" });
    }

    await pool.query(
      `UPDATE deposit_transactions SET provider_ref = $1 WHERE id = $2`,
      [data.data.reference, transactionId]
    );

    res.json({
      transaction_id: transactionId,
      status: "pending",
      provider_action: "redirect",
      redirect_url: data.data.authorization_url,
    });
  } catch (e) {
    console.error("Deposit initiate error:", e.response?.data || e.message);
    res.status(502).json({ error: "Payment provider request failed" });
  }
});

depositsRouter.get("/:transactionId/status", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, status, gems_amount FROM deposit_transactions
       WHERE id = $1 AND user_id = $2`,
      [req.params.transactionId, req.user.user_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Transaction not found" });
    const tx = result.rows[0];
    res.json({ transaction_id: tx.id, status: tx.status, gems_amount: tx.gems_amount });
  } catch (e) {
    console.error("Status fetch error:", e);
    res.status(500).json({ error: "Could not fetch status" });
  }
});

// Fallback for when the webhook is slow or was missed: the client can call
// this after ~2-3 minutes of a still-pending status. It asks Paystack
// directly rather than trusting anything the client claims.
depositsRouter.post("/:transactionId/verify", requireAuth, async (req, res) => {
  try {
    const txResult = await pool.query(
      `SELECT id, provider_ref, status FROM deposit_transactions
       WHERE id = $1 AND user_id = $2`,
      [req.params.transactionId, req.user.user_id]
    );
    if (!txResult.rows.length) return res.status(404).json({ error: "Transaction not found" });
    const tx = txResult.rows[0];

    if (tx.status !== "pending") {
      return res.json({ transaction_id: tx.id, status: tx.status });
    }

    const { data } = await paystack.get(`/transaction/verify/${tx.provider_ref || tx.id}`);

    if (data.data?.status === "success") {
      await creditGemsOnce(tx.id);
    } else if (["failed", "abandoned"].includes(data.data?.status)) {
      await markFailed(tx.id);
    }

    const refreshed = await pool.query(
      `SELECT status, gems_amount FROM deposit_transactions WHERE id = $1`,
      [tx.id]
    );
    res.json({
      transaction_id: tx.id,
      status: refreshed.rows[0].status,
      gems_amount: refreshed.rows[0].gems_amount,
    });
  } catch (e) {
    console.error("Verify error:", e.response?.data || e.message);
    res.status(502).json({ error: "Could not verify with payment provider" });
  }
});

async function markFailed(transactionId) {
  await pool.query(
    `UPDATE deposit_transactions SET status = 'failed' WHERE id = $1 AND status = 'pending'`,
    [transactionId]
  );
}
