# `@solana-tdp/sdk` — TypeScript SDK

TypeScript client for the [Solana Token Distribution Protocol](https://github.com/simplyvest/simplyvest) program, providing typed IDL wrappers, PDA derivation helpers, and event parsing.

## Installation

```bash
pnpm add @solana-tdp/sdk
```

## Modules

| Module      | Purpose                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `program`   | Build a read-only Anchor `Program` instance from a `Connection`                                                    |
| `pda`       | Derive PDAs for streams, milestone streams, vaults, creator config                                                 |
| `accounts`  | Build account structs for all 7 program instructions                                                               |
| `fetch`     | Fetch and decode on-chain accounts (streams, milestones, creator config)                                           |
| `decode`    | Low-level Borsh decoding of raw account data                                                                       |
| `vesting`   | Client-side vesting math: status, claimable amount, vested %                                                       |
| `events`    | Parse and filter program events from transaction logs                                                              |
| `token`     | Build SPL token creation instructions (mint + metadata)                                                            |
| `metadata`  | Fetch Metaplex token metadata, format addresses/labels (`formatAddress`, `fetchTokenMetadata`, `formatTokenLabel`) |
| `constants` | Program ID, account discriminators, account sizes                                                                  |
| `types`     | TypeScript interfaces for `StreamAccount`, `MilestoneStreamAccount`, `CreatorConfig`                               |

## Quick Start

```ts
import { Connection } from "@solana/web3.js";
import { buildReadProgram, fetchStreamsByCreator } from "@solana-tdp/sdk";

const connection = new Connection("https://api.devnet.solana.com");

// Read-only program instance
const program = buildReadProgram(connection);

// Fetch all streams for a creator
const streams = await fetchStreamsByCreator(connection, creatorPublicKey);
```

## Vesting Helpers

```ts
import { getStatus, getClaimable, getVestedPercent } from "@solana-tdp/sdk";

const status = getStatus(stream, Math.floor(Date.now() / 1000)); // "active" | "completed" | "cancelled"
const claimable = getClaimable(stream, Math.floor(Date.now() / 1000));
const percent = getVestedPercent(stream, Math.floor(Date.now() / 1000));
```

## PDA Derivation

```ts
import { getStreamPda, getVaultPda, getCreatorConfigPda } from "@solana-tdp/sdk";
import { BN } from "@coral-xyz/anchor";

const [streamPda] = getStreamPda(creator, recipient, mint, new BN(0), programId);
const [vaultPda] = getVaultPda(streamPda, programId);
const [configPda] = getCreatorConfigPda(creator, programId);
```

## Development

```bash
# Sync IDL from Anchor build output
pnpm sync

# Build
pnpm build

# Type-check
pnpm typecheck
```

## License

MIT
