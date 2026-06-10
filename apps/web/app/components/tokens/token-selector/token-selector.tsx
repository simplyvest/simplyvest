import { useState, useMemo } from "react";

import { useTokenList } from "@/hooks/use-token-list";
import { cn } from "@/utils/cn";

import type { PickerToken } from "./token-picker-dialog";

import { COMMON_TOKENS } from "./common-tokens";
import { TokenPickerDialog } from "./token-picker-dialog";
import { useOwnedTokens } from "./use-owned-tokens";

export function TokenSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (mintAddress: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { tokens: walletTokens, loading } = useOwnedTokens();
  const { data: apiTokens } = useTokenList("visible");

  const { svTokens, ownedTokens } = useMemo(() => {
    if (!walletTokens.length) return { svTokens: [], ownedTokens: [] };

    const apiMap = new Map(apiTokens?.map((a) => [a.mintAddress, a]) ?? []);

    const mapped: PickerToken[] = walletTokens.map((t) => {
      const mintStr = t.mint.toBase58();
      const api = apiMap.get(mintStr);
      return {
        mint: mintStr,
        balance: t.balance,
        name: api?.name ?? t.meta?.name ?? `${mintStr.slice(0, 4)}...${mintStr.slice(-4)}`,
        symbol: api?.symbol ?? t.meta?.symbol ?? "???",
        iconUrl: api?.metadataUri ?? t.meta?.uri,
        decimals: api?.decimals ?? 6,
        isSV: api?.created_here ?? false,
      };
    });

    const visible = mapped.filter((t) => {
      if (!apiTokens) return true;
      const api = apiMap.get(t.mint);
      return api?.visible !== false;
    });

    return {
      svTokens: visible.filter((t) => t.isSV),
      ownedTokens: visible.filter((t) => !t.isSV),
    };
  }, [walletTokens, apiTokens]);

  const commonTokens = useMemo(() => {
    const ownedMints = new Set([...svTokens.map((t) => t.mint), ...ownedTokens.map((t) => t.mint)]);
    const deduped = COMMON_TOKENS.filter((c) => !ownedMints.has(c.mint));
    return deduped.map(
      (c): PickerToken => ({
        mint: c.mint,
        name: c.name,
        symbol: c.symbol,
        iconUrl: c.logoURI,
        decimals: c.decimals,
        isSV: false,
      }),
    );
  }, [svTokens, ownedTokens]);

  const selectedToken = useMemo(() => {
    if (!value) return null;
    return [...svTokens, ...ownedTokens, ...commonTokens].find((t) => t.mint === value) ?? null;
  }, [value, svTokens, ownedTokens, commonTokens]);

  function handleSelectToken(mint: string) {
    onChange(mint);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "flex h-10 w-full items-center gap-3 rounded-lg border border-border2 bg-bg2 px-3.5 text-left transition-colors hover:bg-border",
        )}
      >
        {selectedToken ? (
          <>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bg1 text-xs font-semibold">
              {selectedToken.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium">{selectedToken.name}</span>
              {selectedToken.isSV && (
                <span className="ml-1.5 inline-flex items-center rounded bg-tag2 px-1.5 py-0.5 text-[0.6rem] font-mono uppercase tracking-wide text-tag2t">
                  SV
                </span>
              )}
            </div>
            <span className="text-xs text-muted">{selectedToken.symbol}</span>
          </>
        ) : (
          <span className="text-sm text-muted">Select token</span>
        )}
      </button>

      <TokenPickerDialog
        open={open}
        onOpenChange={setOpen}
        svTokens={svTokens}
        ownedTokens={ownedTokens}
        commonTokens={commonTokens}
        loading={loading}
        selectedMint={value}
        onSelectToken={handleSelectToken}
      />
    </>
  );
}
