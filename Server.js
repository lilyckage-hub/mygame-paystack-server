import "dotenv/config";
import express from "express";
import cors from "cors";

import { authRouter } from "./auth.js";
import { walletRouter } from "./wallet.js";
import { depositsRouter } from "./deposits.js";
import { webhooksRouter } from "./webhooks.js";
import { shopRouter } from "./shop.js";
import { giftsRouter } from "./gifts.js";

const REQUIRED_ENV = ["PAYSTACK_SECRET_KEY"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();

app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean),
  })
);

// The Paystack webhook route needs the RAW request body to verify the
// signature, so it's mounted with express.raw() BEFORE the global
// express.json() below. Order matters here — if express.json() ran first,
// req.body would already be a parsed object and the signature check in
// webhooks.js would never match.
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhooksRouter);

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/deposits", depositsRouter);
app.use("/api/shop", shopRouter);
app.use("/api/gifts", giftsRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`GLITCH server listening on port ${port}`));
