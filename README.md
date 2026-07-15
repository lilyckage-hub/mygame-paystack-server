# GLITCH Server

Backend for the GLITCH app — accounts, wallet, Paystack deposits (mobile
money + card), the character/item shop, and gifting. This is the real
implementation of `glitch-deposits-backend-spec.md` and
`glitch-paystack-integration.md` from earlier.

## What's here

```
server.js      entry point — wires everything together, webhook body-parsing order
db.js          Postgres connection pool
catalog.js     server-side prices for gem packs and shop items (client never sets these)
auth.js        register / login / JWT middleware
wallet.js      GET current gem + coin balance
deposits.js    start a Paystack charge, poll status, verify fallback
webhooks.js    Paystack webhook — signature check + one-time gem credit
shop.js        buy an item with gems
gifts.js       send an owned item to another user
schema.sql     database tables
```

---

## 1. Local setup

**Requirements:** Node 18+, a Postgres database (local, or a free one from
Render/Supabase/Neon while developing).

```bash
npm install
cp .env.example .env
# edit .env: set DATABASE_URL, JWT_SECRET, PAYSTACK_SECRET_KEY (test key is fine)
```

Create the tables:

```bash
psql "$DATABASE_URL" -f schema.sql
```

Run it:

```bash
npm run dev
# -> GLITCH server listening on port 3001
```

Sanity check:

```bash
curl http://localhost:3001/health
# {"ok":true}
```

### Testing the webhook locally

Paystack needs a public URL to call, so use a tunnel:

```bash
npx ngrok http 3001
```

Paste the `https://xxxx.ngrok.io/api/webhooks/paystack` URL into
**Paystack Dashboard → Settings → API Keys & Webhooks → Webhook URL**, using
your test-mode keys. Trigger a test mobile money charge and watch your
server logs for `Credited N gems to user ...`.

---

## 2. Deploying to Render

### a) Create the database

1. Render dashboard → **New +** → **PostgreSQL**
2. Name it (e.g. `glitch-db`), pick a region close to your users, free tier
   is fine to start
3. Once it's up, open its page and copy the **Internal Database URL**
4. Run the schema against it. Easiest way without installing anything
   locally: Render's PostgreSQL page has a **Connect** button with a
   `psql` command you can run from your own terminal if you have `psql`
   installed, or use Render's web-based shell if available on your plan:
   ```bash
   psql "<External Database URL>" -f schema.sql
   ```
   (Use the **External** URL for this one-off command from your own
   machine; the app itself will use the **Internal** URL once deployed,
   which is faster and doesn't count against external connection limits.)

### b) Push this code to GitHub

```bash
git init
git add .
git commit -m "GLITCH backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/glitch-server.git
git push -u origin main
```

### c) Create the web service

1. Render dashboard → **New +** → **Web Service**
2. Connect the `glitch-server` repo
3. Settings:
   - **Environment:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add environment variables (Render's dashboard, not a committed file):
   ```
   DATABASE_URL          = <the Internal Database URL from step a>
   JWT_SECRET             = <generate: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
   PAYSTACK_SECRET_KEY    = sk_test_xxxxx   (switch to sk_live_ once verified)
   PAYSTACK_PUBLIC_KEY    = pk_test_xxxxx
   ALLOWED_ORIGINS        = https://your-frontend-domain.com
   NODE_ENV                = production
   ```
5. Deploy. Render builds and starts it; you'll get a URL like
   `https://glitch-api.onrender.com`.

### d) Point Paystack's webhook at the live URL

Dashboard → Settings → API Keys & Webhooks → Webhook URL:
```
https://glitch-api.onrender.com/api/webhooks/paystack
```
Do this for both test and live key pairs (they have separate webhook URLs).

### e) Point the frontend at it

In the React app, replace the local `useState`-seeded balances and the
`setTimeout`-faked deposit flow with real calls to
`https://glitch-api.onrender.com/api/...`. Concretely:

- On login, store the returned JWT and send it as
  `Authorization: Bearer <token>` on every request after that.
- `DepositModal`'s confirm button → `POST /api/deposits/initiate`, then poll
  `GET /api/deposits/:id/status` every 2–3s until it's no longer `pending`
  (call `POST /api/deposits/:id/verify` as a fallback if it's been pending
  for ~3 minutes).
- Wallet balance → `GET /api/wallet` on screen load instead of local state.
- `buyItem` / `sendGift` → `POST /api/shop/purchase` / `POST /api/gifts/send`.

---

## 3. Free-tier note

Render's free web service tier spins down after inactivity and takes ~30–60s
to wake back up on the next request — fine for testing, but expect a slow
first request after idle periods. Upgrade to a paid instance before
directing real users at it if that cold-start delay matters for your launch.

## 4. Before you take real payments

- Switch from `sk_test_` / `pk_test_` to `sk_live_` / `pk_live_` only after
  Paystack approves your business verification.
- Re-read the **Security checklist** in `glitch-deposits-backend-spec.md` —
  amount validation, signature verification, and idempotency are all already
  implemented here, but it's worth understanding *why* before you're
  debugging a discrepancy with real money on the line.
- Set up daily reconciliation: compare Paystack's settlement report against
  your `deposit_transactions` table where `status = 'completed'`. Webhooks
  can be missed even with everything above done correctly — the `verify`
  endpoint here handles the common case (client-side polling catches a
  missed webhook), but a periodic server-side reconciliation job is what
  catches the rest.
