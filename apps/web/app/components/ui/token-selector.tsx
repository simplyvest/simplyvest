import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as React from "react";

import { cn } from "@/utils/cn";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

interface TokenInfo {
  mint: string;
  balance: string;
  rawAmount: bigint;
  decimals: number;
}

export function TokenSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (mint: string) => void;
}) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [tokens, setTokens] = React.useState<TokenInfo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showCustom, setShowCustom] = React.useState(false);
  const [customMint, setCustomMint] = React.useState("");
  const selectRef = React.useRef<HTMLSelectElement>(null);

  React.useEffect(() => {
    if (!wallet.publicKey) {
      setTokens([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    connection
      .getParsedTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_PROGRAM_ID })
      .then((result) => {
        if (cancelled) return;

        const parsed: TokenInfo[] = result.value
          .map(({ account }) => {
            const info = account.data.parsed.info;
            return {
              mint: info.mint,
              balance:
                Number(info.tokenAmount.uiAmount).toLocaleString(undefined, {
                  maximumFractionDigits: info.tokenAmount.decimals,
                }) || "0",
              rawAmount: BigInt(info.tokenAmount.amount),
              decimals: info.tokenAmount.decimals,
            };
          })
          .filter((t) => t.rawAmount > 0n);
        setTokens(parsed);
      })
      .catch(() => {
        if (!cancelled) setTokens([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wallet.publicKey, connection]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setShowCustom(true);
      setCustomMint("");
      onChange("");
    } else {
      setShowCustom(false);
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <select
          ref={selectRef}
          value={showCustom ? "__custom__" : value || ""}
          onChange={handleSelectChange}
          className={cn(
            "w-full rounded-md border border-border2 bg-bg2 px-3.5 py-2.5 pr-8 text-sm text-text focus-visible:border-sol focus-visible:ring-2 focus-visible:ring-sol focus:outline-none transition-colors appearance-none",
            !value && !showCustom && "text-dim",
          )}
        >
          {!value && !showCustom && (
            <option value="" disabled>
              {loading
                ? "Loading tokens..."
                : wallet.publicKey
                  ? "Select a token"
                  : "Connect wallet to see tokens"}
            </option>
          )}
          {tokens.map((t) => (
            <option key={t.mint} value={t.mint}>
              {t.mint.slice(0, 8)}...{t.mint.slice(-4)} ({t.balance})
            </option>
          ))}
          <option value="__custom__">
            {tokens.length > 0 ? "Custom token..." : "Enter custom token address"}
          </option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-dim">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {showCustom && (
        <input
          type="text"
          placeholder="Enter SPL token mint address"
          value={customMint}
          onChange={(e) => {
            setCustomMint(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full rounded-md border border-border2 bg-bg2 px-3.5 py-2.5 text-sm text-text placeholder:text-dim focus-visible:border-sol focus-visible:ring-2 focus-visible:ring-sol focus:outline-none transition-colors"
        />
      )}
    </div>
  );
}
