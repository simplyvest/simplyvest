# `@solana-tdp/web` — Web Frontend

React frontend for the Solana Token Distribution Protocol, built with Vite, TanStack Router, and Tailwind CSS.

## Features

- **Vite** — Fast dev server and optimized builds
- **TanStack Router** — Type-safe file-based routing
- **TanStack Query** — Server state management
- **Tailwind CSS v4** — Utility-first styling with dark theme
- **Solana Wallet Integration** — Wallet adapter with Phantom and Solflare support

## Prerequisites

- Node.js v18+ and pnpm

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
│   │   ├── solana/
│   │   │   ├── solana-provider.tsx   # Solana wallet provider setup
│   │   │   └── wallet-button.tsx     # Connect/disconnect button
│   │   └── ui/
│   │       └── button.tsx            # Reusable Button (cva-based)
│   ├── routes/
│   │   ├── __root.tsx                # Root layout with nav, wallet, footer
│   │   └── index.tsx                 # Home page
│   ├── utils/
│   │   └── cn.ts                     # clsx + tailwind-merge helper
│   ├── main.tsx                      # App entry point
│   ├── routeTree.gen.ts              # Generated route tree
│   └── styles.css                    # Tailwind theme configuration
├── index.html
├── vite.config.ts
├── tsconfig.json
├── .env.example
└── package.json
```

## Scripts

| Script     | Description                        |
| ---------- | ---------------------------------- |
| `dev`      | Start Vite dev server              |
| `build`    | Type-check + Vite production build |
| `preview`  | Preview production build           |
| `check:ts` | Type-check without emitting        |
