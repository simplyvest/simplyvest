# `@solana-tdp/api` — Cloudflare Worker

Backend proxy for the SimplyVest waitlist form. Authenticates via Google service account JWT and appends submissions to a Google Sheet.

## Development

```bash
pnpm dev
```

Requires `.dev.vars` with Google credentials (see `.dev.vars.example`).

## Deploy

```bash
pnpm deploy
```

Secrets are set via `wrangler secret put` and persist across deploys.

## Environment

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes | Service account email from GCP JSON |
| `GOOGLE_PRIVATE_KEY` | Yes | PEM private key (with real newlines) |
| `GOOGLE_SHEET_ID` | Yes | ID from the sheet URL |
| `GOOGLE_SHEET_NAME` | No | Sheet tab name (default: "Sheet1") |
