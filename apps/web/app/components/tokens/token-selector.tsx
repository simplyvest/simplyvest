import { fetchTokenMetadata, formatTokenLabel } from "@solana-tdp/sdk";
import type { TokenMetadata } from "@solana-tdp/sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect, useRef } from "react";

import { FormField } from "@/components/ui/form-field";
import { SelectInput } from "@/components/ui/select-input";
import { TextInput } from "@/components/ui/text-input";

interface TokenInfo {
  mint: PublicKey;
  balance: bigint;
  address: PublicKey;
  meta: TokenMetadata | null;
}

export function TokenSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (mintAddress: string) => void;
}) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"owned" | "custom">("owned");
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    let cancelled = false;
    if (publicKey) {
      setLoading(true);
      void (async () => {
        try {
          const { value: accounts } = await connection.getTokenAccountsByOwner(publicKey, {
            programId: TOKEN_PROGRAM_ID,
          });
          const mints = accounts
            .map((acc) => {
              const data = Buffer.from(acc.account.data);
              const mint = new PublicKey(data.subarray(0, 32));
              const balance = data.readBigUInt64LE(64);
              return { mint, balance, address: acc.pubkey };
            })
            .filter((t) => t.balance > 0);
          mints.sort((a, b) => Number(b.balance - a.balance));
          const metaMap = new Map<string, TokenMetadata | null>();
          await Promise.all(
            mints.map(async (t) => {
              const key = t.mint.toBase58();
              if (!metaMap.has(key)) {
                const meta = await fetchTokenMetadata(connection, t.mint);
                metaMap.set(key, meta);
              }
            }),
          );
          if (cancelled) return;
          const list = mints.map((t) => {
            const meta = metaMap.get(t.mint.toBase58()) ?? null;
            return Object.assign(t, { meta });
          });
          setTokens(list);
          if (list.length > 0 && !valueRef.current) {
            onChangeRef.current(mintToAddress(list[0].mint));
          }
        } catch {}
        if (!cancelled) setLoading(false);
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  if (mode === "custom") {
    return (
      <FormField label="Token Mint Address" required>
        <div className="flex gap-2">
          <TextInput
            placeholder="Enter SPL token mint address"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setMode("owned")}
            className="rounded-md border border-border2 bg-bg2 px-3 py-2 text-sm text-muted transition-colors hover:text-text"
          >
            Owned
          </button>
        </div>
      </FormField>
    );
  }

  return (
    <FormField label="Token" required>
      <div className="flex gap-2">
        <SelectInput
          value={mintToAddress(tokens.find((t) => mintToAddress(t.mint) === value)?.mint ?? null)}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          disabled={loading}
        >
          {loading ? (
            <option value="">Loading tokens...</option>
          ) : tokens.length === 0 ? (
            <option value="">No tokens found</option>
          ) : (
            tokens.map((t) => (
              <option key={mintToAddress(t.mint)} value={mintToAddress(t.mint)}>
                {formatTokenLabel(t.meta, t.mint)} — {Number(t.balance) / 10 ** 6}
              </option>
            ))
          )}
        </SelectInput>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className="rounded-md border border-border2 bg-bg2 px-3 py-2 text-sm text-muted transition-colors hover:text-text"
        >
          Custom
        </button>
      </div>
    </FormField>
  );
}

function mintToAddress(mint: PublicKey | null): string {
  return mint?.toBase58() ?? "";
}
