import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { SelectInput } from "@/components/ui/select-input";
import { TextInput } from "@/components/ui/text-input";
import { FormField } from "@/components/ui/form-field";

interface TokenInfo {
  mint: PublicKey;
  balance: bigint;
  address: PublicKey;
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

  useEffect(() => {
    if (!publicKey) return;
    setLoading(true);
    connection
      .getTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID })
      .then(({ value: accounts }) => {
        const list: TokenInfo[] = accounts.map((acc) => {
          const data = Buffer.from(acc.account.data);
          const mint = new PublicKey(data.slice(0, 32));
          const balance = data.readBigUInt64LE(64);
          return { mint, balance, address: acc.pubkey };
        }).filter((t) => t.balance > 0);
        list.sort((a, b) => Number(b.balance - a.balance));
        setTokens(list);
        if (list.length > 0 && !value) {
          onChange(mintToAddress(list[0].mint));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
                {mintToAddress(t.mint)} ({Number(t.balance) / 10 ** 6})
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
