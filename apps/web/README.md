# `@solana-tdp/web` — Web Frontend

React frontend for the Solana Token Distribution Protocol, built with Vite, TanStack Router, and Tailwind CSS.

## Features

- **Vite** — Fast dev server and optimized builds
- **TanStack Router** — Type-safe file-based routing
- **TanStack Query** — Server state management
- **Tailwind CSS v4** — Utility-first styling with dark theme
- **Privy Auth** — Embedded wallet and social login
- **Solana Web3.js** — On-chain program interaction via Anchor
- **Storybook** — Component development and visual testing
- **Playwright** — Browser integration tests

## Prerequisites

- Node.js v24+ and pnpm

## Getting Started

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start dev server
pnpm --filter @solana-tdp/web dev

# Type-check
pnpm --filter @solana-tdp/web check:ts

# Build for production
pnpm --filter @solana-tdp/web build
```

## Environment

Copy `.env.example` to `.env` and configure:

| Variable              | Default                         | Description         |
| --------------------- | ------------------------------- | ------------------- |
| `VITE_SOLANA_RPC_URL` | `https://api.devnet.solana.com` | Solana RPC endpoint |

## Project Structure

```
apps/web/
├── app/
│   ├── components/
│   │   ├── docs/          # Documentation pages
│   │   ├── layout/        # App shell, nav, footer
│   │   ├── marketing/     # Landing page sections
│   │   ├── orgs/          # Organization management
│   │   ├── profile/       # User profile
│   │   ├── solana/        # Wallet provider, connection
│   │   ├── streams/       # Stream list, detail, create forms
│   │   ├── tokens/        # Token picker, creator
│   │   ├── tools/         # Token creation tools
│   │   └── ui/            # Shared UI primitives (Button, Card, etc.)
│   ├── hooks/
│   │   ├── tx/                        # Transaction handling hooks
│   │   ├── use-stream.ts             # Stream data hooks
│   │   ├── use-stream-detail.ts      # Single stream detail
│   │   ├── use-stream-events.ts      # Stream event parsing
│   │   ├── use-stream-role.ts        # Creator vs recipient role
│   │   ├── use-api.ts                # API client hooks
│   │   ├── use-program.ts            # Anchor program hooks
│   │   ├── use-sol-balance.ts        # SOL balance
│   │   ├── use-token-list.ts         # Token list
│   │   ├── use-token-preferences.ts  # Token preferences
│   │   ├── use-create-token.ts       # Token creation flow
│   │   └── use-create-platform-token.ts # Platform token creation
│   ├── routes/            # 25 file-based routes (dashboard, streams, tokens, tools)
│   ├── types/             # Shared TypeScript types
│   ├── utils/             # cn(), formatters
│   ├── main.tsx           # App entry point
│   └── styles.css         # Tailwind theme
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Scripts

| Script            | Description                            |
| ----------------- | -------------------------------------- |
| `dev`             | Start Vite dev server                  |
| `build`           | Type-check + Vite production build     |
| `preview`         | Preview production build               |
| `check:ts`        | Type-check without emitting            |
| `test`            | Run all tests (unit + storybook)       |
| `test:unit`       | Run unit tests only                    |
| `test:storybook`  | Run Storybook browser tests            |
| `test:ci`         | Run unit + storybook tests combined    |
| `storybook`       | Start Storybook dev server (port 6006) |
| `build-storybook` | Build Storybook for deployment         |
