# Deployment — Solana Token Distribution Protocol

Building, testing, and deploying the Solana program and web frontend.

## Contents

1. [Prerequisites](#prerequisites)
2. [Building](#building)
3. [Testing](#testing)
4. [Program deployment](#program-deployment)
5. [Frontend deployment](#frontend-deployment)
6. [CI/CD](#cicd)
7. [Browser compatibility](#browser-compatibility)

---

## Prerequisites

- [Rust](https://rustup.rs/) — `rustup install stable`
  |- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) — v3.1.12
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) — v0.32.1
- [Node.js](https://nodejs.org/) v18+ + [pnpm](https://pnpm.io/) (install: `corepack enable && corepack prepare pnpm@latest --activate`)

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

Update `declare_id!("...")` in `programs/tdp/src/lib.rs` and `[programs.localnet]` in `Anchor.toml` with the output, then rebuild.

---

## Testing

Tests run on [Anchor LiteSVM](https://github.com/LiteSVM/anchor-litesvm) with [LiteSVM](https://github.com/LiteSVM/litesvm) underneath — no local validator needed.

```bash
# Run all tests (program + SDK)
pnpm test

# Or just the program tests using anchor
cd apps/solana-tdp-anchor
anchor test
```

### Test files

| File                                   | What it tests                                        |
| -------------------------------------- | ---------------------------------------------------- |
| `solana-tdp.000.create-stream.test.ts` | Stream creation with valid/invalid parameters        |
| `solana-tdp.001.withdraw.test.ts`      | Claiming vested tokens, cliff checks, partial claims |
| `solana-tdp.002.cancel.test.ts`        | Mid-stream cancellation, vested/unvested split       |
| `solana-tdp.003.milestone.test.ts`     | Milestone stream creation, trigger, withdraw, cancel |

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

## Frontend deployment

The React frontend (`apps/web`) is deployed to Cloudflare Pages via GitHub Actions. A push to `main` that touches `apps/web/` or `packages/solana-tdp-sdk/` triggers an automatic build and deploy.

Preview deploys are created for pull requests at `<branch>.solana-tdp-web.pages.dev`.

### One-time setup

1. Create a Cloudflare API token: Dashboard > API Tokens > Create Token > Custom > `Account > Cloudflare Pages > Edit`
2. Get your Account ID from the Cloudflare dashboard sidebar
3. Create the Pages project:
   ```bash
   pnpm dlx wrangler pages project create solana-tdp-web --production-branch=main
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
# Authenticate once
pnpm dlx wrangler login

# Build and deploy
pnpm --filter @solana-tdp/web build
pnpm wrangler pages deploy apps/web/dist --project-name=simplyvest
```

SPA routing works out of the box — Cloudflare Pages auto-detects a client-side router when there is no `404.html` and serves `index.html` for all unmatched paths.

---

## CI/CD

The CI pipeline (`.github/workflows/ci.yaml`) runs on:

- Push to `main`
- Pull requests targeting `main`

| Job           | What it does                                             | Tooling needed                                                                         |
| ------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `lint`        | JS/TS lint with oxlint                                   | Node 24, pnpm (cached)                                                                 |
| `format`      | Format check with oxfmt                                  | Node 24, pnpm (cached)                                                                 |
| `typecheck-*` | TypeScript check (web/api/anchor-ts)                     | Node 24, pnpm (cached), SDK build                                                      |
| `test-web`    | Unit + Storybook browser tests with Vitest               | Node 24, pnpm (cached), Playwright Chromium                                            |
| `anchor`      | Build Anchor program + run LiteSVM tests                 | Solana CLI + Anchor CLI (cached), Rust (cached via Swatinem/rust-cache), Node 24, pnpm |
| `build-web`   | Production build of React frontend                       | Node 24, pnpm (cached), SDK build                                                      |
| `deploy-web`  | Deploy to Cloudflare Pages (main only, blocked on tests) | Node 24, pnpm + Cloudflare secrets                                                     |

The `deploy-web` job uses `cloudflare/wrangler-action@v3` and runs only on
push to `main`. Preview deploys for PRs are handled by Cloudflare's git integration.

---

## Browser compatibility

Solana's web3.js and wallet adapter libraries use Node.js globals (`Buffer`, `process`, `global`) that do not exist in browsers. The web frontend polyfills them in `apps/web/app/main.tsx`:

```ts
import { Buffer } from "buffer";
import process from "process";
globalThis.Buffer = Buffer;
globalThis.process = process;
```

The Vite config also maps `global` to `globalThis`:

```ts
// apps/web/vite.config.ts
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
