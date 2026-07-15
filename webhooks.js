import { Router } from "express";
import crypto from "crypto";
import { pool } from "./db.js";

export const webhooksRouter = Router();

// IMPORTANT: this route must receive the RAW request body, not a
// JSON-parsed object, because Paystack's signature is computed over the
// exact bytes they sent. The raw-body middleware for this one route is
// wired in server.js, mounted BEFORE the global express.json() middleware
// reaches it.
webhooksRouter.post("/paystack", async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  if (!signature) return res.status(401).end();

  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.body) // raw Buffer
    .digest("hex");

  if (expected !== signature) {
    console.warn("Paystack webhook: signature mismatch");
    return res.status(401).end();
  }

  let event;
  try {
    event = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).end();
  }

  // Always respond quickly — Paystack retries repeatedly on non-200s.
  // Do the DB work first since it's fast, then respond.
  try {
    if (event.event === "charge.success") {
      await creditGemsOnce(event.data.reference);
    } else if (event.event === "charge.failed") {
      await pool.query(
        `UPDATE deposit_transactions SET status = 'failed'
         WHERE id = $1 AND status = 'pending'`,
        [event.data.reference]
      );
    }
    // Other event types (transfer events, disputes, etc.) are ignored here —
    // add handlers as needed.
  } catch (e) {
    console.error("Webhook processing error:", e);
    // Still return 200: the error is logged for investigation, but we don't
    // want Paystack hammering retries for a bug on our side indefinitely.
    // Reconcile via the daily settlement report instead (see README).
  }

  res.status(200).end();
});

async function creditGemsOnce(reference) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const txResult = await client.query(
      `SELECT id, user_id, gems_amount, status FROM deposit_transactions
       WHERE id = $1 FOR UPDATE`,
      [reference]
    );

    if (!txResult.rows.length) {
      console.warn("Webhook for unknown reference:", reference);
      await client.query("ROLLBACK");
      return;
    }

    const tx = txResult.rows[0];
    if (tx.status !== "pending") {
      // Already handled — Paystack retried the webhook, or verify-fallback
      // already processed it. This is the idempotency guard.
      await client.query("ROLLBACK");
      return;
    }

    await client.query(`UPDATE wallets SET gems = gems + $1 WHERE user_id = $2`, [
      tx.gems_amount,
      tx.user_id,
    ]);
    await client.query(
      `UPDATE deposit_transactions SET status = 'completed', completed_at = NOW() WHERE id = $1`,
      [tx.id]
    );

    await client.query("COMMIT");
    console.log(`Credited ${tx.gems_amount} gems to user ${tx.user_id} (tx ${tx.id})`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export { creditGemsOnce };
