import { formatTokenLabel } from "@solana-tdp/sdk";

import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

import type { TokenInfo } from "./use-owned-tokens";

import { mintToAddress } from "./use-owned-tokens";

export function OwnedTokenSelect({
  tokens,
  loading,
  value,
  onChange,
  onSwitchToCustom,
}: {
  tokens: TokenInfo[];
  loading: boolean;
  value: string;
  onChange: (mintAddress: string) => void;
  onSwitchToCustom: () => void;
}) {
  return (
    <Field label="Token" required>
      <div className="flex gap-2">
        <Select
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
        </Select>
        <button
          type="button"
          onClick={onSwitchToCustom}
          className="rounded-md border border-border2 bg-bg2 px-3 py-2 text-sm text-muted transition-colors hover:text-text"
        >
          Custom
        </button>
      </div>
    </Field>
  );
}
