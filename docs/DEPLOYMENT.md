# Deployment — Solana Token Distribution Protocol

Building, testing, and deploying the Solana program, API, and web frontend.

## Contents

1. [Prerequisites](#prerequisites)
2. [Building](#building)
3. [Testing](#testing)
4. [Program deployment](#program-deployment)
5. [API deployment](#api-deployment)
6. [Frontend deployment](#frontend-deployment)
7. [CI/CD](#cicd)
8. [Browser compatibility](#browser-compatibility)

---

## Prerequisites

- [Rust](https://rustup.rs/) — `rustup install stable`
  |- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) — v3.1.12
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) — v0.32.1
- [Node.js](https://nodejs.org/) v24+ + [pnpm](https://pnpm.io/) (install: `corepack enable && corepack prepare pnpm@latest --activate`)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) — for API deployment (installed as devDependency)

---

## Building

```bash
# Install dependencies for all workspaces
pnpm install

# Build everything (packages + program)
pnpm build
```

### Targeted scripts

| Script               | What it does                                                      |
| -------------------- | ----------------------------------------------------------------- |
| `pnpm program:build` | Builds the Anchor program, syncs the IDL into the SDK, builds SDK |
| `pnpm sdk:sync`      | Copies the latest IDL from the program build into the SDK package |
| `pnpm sdk:build`     | Builds only the SDK package                                       |

To get the program ID after building:

```bash
cd apps/solana-tdp-anchor
anchor keys list
```

Update `declare_id!("...")` in `programs/solana-tdp/src/lib.rs` and `[programs.localnet]` in `Anchor.toml` with the output, then rebuild.

---

## Testing

Tests run on [Anchor LiteSVM](https://github.com/LiteSVM/anchor-litesvm) with [LiteSVM](https://github.com/LiteSVM/litesvm) underneath — no local validator needed.

```bash
# Run all tests (program + SDK)
pnpm test

# Or just the program tests using anchor
cd apps/solana-tdp-anchor
anchor test

# Web app unit + storybook tests
pnpm --filter @simplyvest/dapp test
pnpm --filter @simplyvest/storybook test:storybook

# Typecheck everything
pnpm check:ts:all
```

### Test files

| File                                    | What it tests                                                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `solana-tdp.000.create-stream.test.ts`  | Stream creation with valid/invalid parameters                                                                                                           |
| `solana-tdp.001.withdraw.test.ts`       | Claiming vested tokens, cliff checks, partial claims                                                                                                    |
| `solana-tdp.002.cancel.test.ts`         | Mid-stream cancellation, vested/unvested split                                                                                                          |
| `solana-tdp.003.milestone.test.ts`      | Milestone stream creation, trigger, withdraw, cancel                                                                                                    |
| `solana-tdp.005.security-audit.test.ts` | 19 security audit tests — signer authority, PDA uniqueness, overflow, account ownership, state transitions, wrong-account attacks, timestamp boundaries |
| `fixtures.ts`                           | Shared test fixtures (token mints, accounts, PDAs)                                                                                                      |

---

## Program deployment

```bash
cd apps/solana-tdp-anchor

# Deploy to devnet
pnpm run deploy

# Verify
solana program show 6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk --url devnet
```

Program ID: [`6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk`](https://explorer.solana.com/address/6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk?cluster=devnet)

### Deployment info

|                |                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Network**    | Solana Devnet                                                                                                                                     |
| **Program ID** | [`6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk`](https://explorer.solana.com/address/6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk?cluster=devnet) |
| **Explorer**   | [Solana Explorer (devnet)](https://explorer.solana.com/?cluster=devnet)                                                                           |

---

## API deployment

The API (`apps/api`) is a Cloudflare Worker with D1 database.

### One-time setup

1. Create D1 database:
   ```bash
   cd apps/api
   npx wrangler d1 create simplyvest-db
   ```
2. Copy the `database_id` from output into `wrangler.toml`
3. Set secrets:
   ```bash
   npx wrangler secret put PRIVY_APP_ID
   npx wrangler secret put PRIVY_APP_SECRET
   ```
4. Apply migrations:
   ```bash
   pnpm db:migrate:remote
   ```

### Deploy

```bash
pnpm deploy:api
```

### Local development

```bash
pnpm dev:api          # Start API on localhost:8787
pnpm --filter @simplyvest/dapp dev
pnpm dev              # Start both in parallel

pnpm db:generate      # Generate new migration from schema changes
pnpm db:migrate       # Apply migrations to local D1
pnpm db:reset         # Drop all tables (local only)
```

### API endpoints

| Method   | Path                            | Auth   | Purpose                        |
| -------- | ------------------------------- | ------ | ------------------------------ |
| `POST`   | `/api/streams`                  | —      | Record new stream              |
| `GET`    | `/api/streams`                  | —      | List streams                   |
| `GET`    | `/api/streams/:id`              | —      | Get stream + events            |
| `POST`   | `/api/streams/:id/sync`         | —      | Sync stream events             |
| `POST`   | `/api/streams/:id/events`       | —      | Record stream event            |
| `GET`    | `/api/users/me`                 | JWT    | Get own profile                |
| `POST`   | `/api/users/me`                 | JWT    | Create profile                 |
| `PUT`    | `/api/users/me`                 | JWT    | Update profile                 |
| `GET`    | `/api/users/:id`                | —      | Get public profile             |
| `POST`   | `/api/orgs`                     | JWT    | Create organization            |
| `GET`    | `/api/orgs/:id`                 | —      | Get org + members              |
| `PUT`    | `/api/orgs/:id`                 | JWT    | Update org                     |
| `POST`   | `/api/orgs/:id/members`         | JWT    | Add member                     |
| `DELETE` | `/api/orgs/:id/members/:userId` | JWT    | Remove member                  |
| `GET`    | `/api/orgs/me/list`             | JWT    | List user's orgs               |
| `POST`   | `/api/reconcile`                | JWT    | Trigger reconciliation         |
| `GET`    | `/api/reconcile/stats`          | JWT    | Reconciliation stats           |
| `POST`   | `/api/waitlist`                 | —      | Legacy waitlist                |
| `GET`    | `/api/tokens/r2/*`              | —      | Serve R2 metadata JSON         |
| `POST`   | `/api/tokens/upload-image`      | Bearer | Upload token image to R2       |
| `POST`   | `/api/tokens/metadata`          | Bearer | Store token metadata           |
| `POST`   | `/api/tokens`                   | —      | Record token info              |
| `GET`    | `/api/tokens`                   | —      | List tokens                    |
| `PATCH`  | `/api/tokens/:mint/visibility`  | —      | Toggle token visibility        |
| `GET`    | `/api/tokens/preferences`       | —      | Get user token preferences     |
| `POST`   | `/api/tokens/create-platform`   | Bearer | Create platform token on-chain |

---

## Docs deployment

The documentation site (`apps/docs`) is an [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) static site, deployed to Cloudflare Pages.

**Production URL:** [simplyvest-docs.pages.dev](https://simplyvest-docs.pages.dev)

### One-time setup

1. Create the Pages project (already done):
   ```bash
   pnpm wrangler pages project create simplyvest-docs --production-branch=main
   ```

### Local manual deploy

```bash
# Build and deploy
pnpm --filter @simplyvest/docs build
pnpm --filter @simplyvest/docs deploy
```

The `deploy` script runs `wrangler pages deploy dist --project-name=simplyvest-docs` from the package directory.

No secrets, API keys, or environment variables are needed — the docs site is pure static content.

---

## Frontend deployment

The React frontend (`apps/dapp`) is deployed to Cloudflare Pages via GitHub Actions. A push to `main` that touches `apps/web/` or `packages/solana-tdp-sdk/` triggers an automatic build and deploy.

**Production URL:** [simplyvest.pages.dev](https://simplyvest.pages.dev)

Preview deploys are created for pull requests at `<branch>.simplyvest.pages.dev`.

### One-time setup

1. Create a Cloudflare API token: Dashboard > API Tokens > Create Token > Custom > `Account > Cloudflare Pages > Edit`
2. Get your Account ID from the Cloudflare dashboard sidebar
3. Create the Pages project:
   ```bash
   pnpm wrangler pages project create simplyvest --production-branch=main
   ```
4. Add two GitHub Actions secrets:
   - `CLOUDFLARE_API_TOKEN` — your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare Account ID

   **Where to scope the secrets:**
   - **Repository level** (recommended) — Settings > Secrets and variables > Actions > Secrets. Available to all workflows without extra config.
   - **Environment level** — If scoped to an environment (e.g., `main`), the workflow job must declare `environment: main` or the secrets won't be visible. Our CI workflow's `deploy-web` job already includes this declaration.

5. Ensure `wrangler` is listed as a root `devDependency` in `package.json`. The `cloudflare/wrangler-action@v3` action tries to install wrangler via `pnpm add wrangler`, but that fails in a pnpm workspace without the `-w` flag (`ERR_PNPM_ADDING_TO_ROOT`). Adding wrangler as a root devDependency pre-installs it so the action finds it ready to use.

### Local manual deploy

```bash
# Build and deploy
pnpm --filter @simplyvest/dapp build
pnpm --filter @simplyvest/dapp deploy
```

The `deploy` script runs `wrangler pages deploy dist --project-name=simplyvest` from the package directory.

SPA routing works out of the box — Cloudflare Pages auto-detects a client-side router when there is no `404.html` and serves `index.html` for all unmatched paths.

---

## Storybook deployment

The [Storybook](https://storybook.js.org) component library (`apps/storybook`) is deployed to Cloudflare Pages as a standalone static site.

**Production URL:** [simplyvest-storybook.pages.dev](https://simplyvest-storybook.pages.dev)

### One-time setup

1. Create the Pages project (already done):
   ```bash
   pnpm wrangler pages project create simplyvest-storybook --production-branch=main
   ```

### Local manual deploy

```bash
# Build SDK (stories import from @solana-tdp/sdk)
pnpm --filter @solana-tdp/sdk build

# Build and deploy
pnpm --filter @simplyvest/storybook build-storybook
pnpm --filter @simplyvest/storybook deploy
```

The `deploy` script runs `wrangler pages deploy storybook-static --project-name=simplyvest-storybook` from the package directory.

---

## CI/CD

Each job has its own reusable workflow file in `.github/workflows/`, called by the orchestrator `ci.yaml`:

| Workflow file           | Job                 | Triggers        | What it does                                             |
| ----------------------- | ------------------- | --------------- | -------------------------------------------------------- |
| `ci.yaml`               | (orchestrator)      | Push/PR to main | Calls all other workflows, deploys on push               |
| `lint.yaml`             | lint                | PRs + main      | JS/TS lint with oxlint                                   |
| `format.yaml`           | format              | PRs + main      | Format check with oxfmt                                  |
| `typecheck-web.yaml`    | typecheck-web       | PRs + main      | TypeScript check (web)                                   |
| `typecheck-api.yaml`    | typecheck-api       | PRs + main      | TypeScript check (API)                                   |
| `typecheck-sdk.yaml`    | typecheck-sdk       | PRs + main      | TypeScript check (SDK)                                   |
| `typecheck-anchor.yaml` | typecheck-anchor-ts | PRs + main      | TypeScript check (anchor)                                |
| `typecheck-docs.yaml`   | typecheck-docs      | PRs + main      | Astro check (docs)                                       |
| `test-api.yaml`         | test-api            | PRs + main      | API tests with vitest                                    |
| `test-web.yaml`         | test-web            | PRs + main      | Build SDK + vitest unit tests (dapp)                     |
| `test-e2e.yaml`         | test-e2e            | PRs + main      | Playwright e2e tests (Chromium, 11 specs)                |
| `test-storybook.yaml`   | test-storybook      | PRs + main      | Storybook vitest browser tests (Chromium + Playwright)   |
| `build-web.yaml`        | build-web           | PRs + main      | Production build of React frontend                       |
| `rust-lint.yaml`        | lint-rust           | PRs + main      | cargo fmt + clippy                                       |
| `anchor.yaml`           | anchor              | PRs + main      | Build Anchor program + vitest tests                      |
| `deploy-web.yaml`       | deploy-web          | main only       | Build SDK + Deploy web to Cloudflare Pages               |
| `deploy-api.yaml`       | deploy-api          | main only       | Build SDK + Deploy API Worker + D1 migrations            |
| `deploy-docs.yaml`      | deploy-docs         | main only       | Build + Deploy docs to Cloudflare Pages                  |
| `deploy-storybook.yaml` | deploy-storybook    | main only       | Build SDK + Build + Deploy storybook to Cloudflare Pages |

### GitHub Actions Variables

Set in **Settings → Secrets and variables → Actions → Variables** (repo level):

| Variable                 | Value                                                       | Used by               |
| ------------------------ | ----------------------------------------------------------- | --------------------- |
| `VITE_API_URL`           | API worker URL (e.g., `https://simplyvest-api.workers.dev`) | deploy-web, build-web |
| `VITE_PRIVY_APP_ID`      | Privy App ID                                                | deploy-web, build-web |
| `VITE_PRIVY_CLIENT_ID`   | Privy Client ID                                             | deploy-web, build-web |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics ID                                         | deploy-web, build-web |
| `VITE_SENTRY_DSN`        | Sentry DSN (optional)                                       | deploy-web            |

### GitHub Actions Secrets

Set in **Settings → Secrets and variables → Actions → Secrets** (environment `main`):

| Secret                  | Value                                       | Used by                                               |
| ----------------------- | ------------------------------------------- | ----------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare API token (Pages + Workers Edit) | deploy-web, deploy-api, deploy-docs, deploy-storybook |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID                       | deploy-web, deploy-api, deploy-docs, deploy-storybook |

**Why environment-scoped?** The deploy jobs declare `environment: main`, so they can access these secrets. PR workflows don't have access — this prevents a malicious PR from leaking credentials.

### Setting secrets/variables via CLI

```bash
# Variables (repo level)
gh variable set VITE_API_URL --body "https://simplyvest-api.workers.dev"
gh variable set VITE_PRIVY_APP_ID --body "your-app-id"
gh variable set VITE_PRIVY_CLIENT_ID --body "your-client-id"
gh variable set VITE_GA_MEASUREMENT_ID --body "G-XXXXXXXXXX"

# Secrets (environment level)
gh secret set CLOUDFLARE_API_TOKEN --env main
gh secret set CLOUDFLARE_ACCOUNT_ID --env main

# Verify
gh variable list
gh secret list --env main
```

---

## Browser compatibility

Solana's web3.js and wallet adapter libraries use Node.js globals (`Buffer`, `process`, `global`) that do not exist in browsers. The dapp frontend polyfills them in `apps/dapp/app/main.tsx`:

```ts
import { Buffer } from "buffer";
import process from "process";
globalThis.Buffer = Buffer;
globalThis.process = process;
```

The Vite config also maps `global` to `globalThis`:

```ts
// apps/dapp/vite.config.ts
define: {
  global: "globalThis",
}
```

If a new dependency triggers a `crypto is not defined` or `stream is not defined` error at runtime, add the corresponding alias to `vite.config.ts`:

| Missing module | Polyfill package    | Vite alias                                            |
| -------------- | ------------------- | ----------------------------------------------------- |
| `crypto`       | `crypto-browserify` | `resolve: { alias: { crypto: "crypto-browserify" } }` |
| `stream`       | `stream-browserify` | `resolve: { alias: { stream: "stream-browserify" } }` |

These are rarely needed — most Solana wallet adapters have browser-native fallbacks. Only add them if you hit actual runtime errors.
