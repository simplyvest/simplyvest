# `@solana-tdp/api` — Cloudflare Worker

Backend API for the Solana Token Distribution Protocol. Hono-based Cloudflare Worker with D1 database, R2 object storage, Privy JWT auth, and on-chain reconciliation.

## Development

```bash
pnpm dev
```

Requires `.env` with the variables below (see `.env.example`).

## Deploy

```bash
pnpm deploy
```

Secrets are set via `wrangler secret put` and persist across deploys.

## Environment

| Variable                       | Required | Description                                    |
| ------------------------------ | -------- | ---------------------------------------------- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes      | Service account email from GCP JSON (waitlist) |
| `GOOGLE_PRIVATE_KEY`           | Yes      | PEM private key with real newlines (waitlist)  |
| `GOOGLE_SHEET_ID`              | Yes      | ID from the sheet URL (waitlist)               |
| `GOOGLE_SHEET_NAME`            | No       | Sheet tab name (default: "Sheet1")             |
| `SOLANA_RPC_URL`               | No       | Solana RPC endpoint (defaults to devnet)       |
| `PRIVY_APP_ID`                 | Yes      | Privy application ID (JWT auth)                |
| `PRIVY_APP_SECRET`             | Yes      | Privy application secret (JWT auth)            |
| `PLATFORM_SECRET_KEY`          | No       | Platform key for bearer token auth             |

D1 database and R2 bucket are bound via `wrangler.toml`.

## Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `dev`               | Start API worker locally (port 8787) |
| `deploy`            | Deploy to Cloudflare Workers         |
| `typecheck`         | Type-check without emitting          |
| `test`              | Run tests with vitest                |
| `db:generate`       | Generate Drizzle migrations          |
| `db:migrate`        | Apply migrations (local D1)          |
| `db:migrate:remote` | Apply migrations (remote D1)         |
| `db:reset`          | Drop all tables (local only)         |

## License

MIT
