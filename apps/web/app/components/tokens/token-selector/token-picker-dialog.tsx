import { Dialog } from "@base-ui/react/dialog";
import { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { TokenRow } from "./token-row";
import { useTokenInfo } from "./use-token-info";

const SKELETON_IDS = ["sk-0", "sk-1", "sk-2", "sk-3"];

export type PickerToken = {
  mint: string;
  name: string;
  symbol: string;
  iconUrl?: string;
  balance?: bigint;
  decimals: number;
  isSV: boolean;
};

type TokenPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  svTokens: PickerToken[];
  ownedTokens: PickerToken[];
  commonTokens: PickerToken[];
  loading: boolean;
  selectedMint: string;
  onSelectToken: (mint: string) => void;
};

function formatBalance(balance: bigint | undefined, decimals: number): string | undefined {
  if (balance === undefined) return undefined;
  const n = Number(balance) / 10 ** decimals;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return n.toFixed(2);
  return n.toPrecision(3);
}

function filterTokens(tokens: PickerToken[], query: string): PickerToken[] {
  if (!query) return tokens;
  const q = query.toLowerCase();
  return tokens.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.symbol.toLowerCase().includes(q) ||
      t.mint.toLowerCase().includes(q),
  );
}

export function TokenPickerDialog({
  open,
  onOpenChange,
  svTokens,
  ownedTokens,
  commonTokens,
  loading,
  selectedMint,
  onSelectToken,
}: TokenPickerDialogProps) {
  const [search, setSearch] = useState("");
  const [customMint, setCustomMint] = useState("");
  const {
    label: customLabel,
    error: customError,
    loading: customLoading,
  } = useTokenInfo(open ? customMint : "");

  useEffect(() => {
    if (open) {
      setSearch("");
      setCustomMint("");
    }
  }, [open]);

  const filteredSV = useMemo(() => filterTokens(svTokens, search), [svTokens, search]);
  const filteredOwned = useMemo(() => filterTokens(ownedTokens, search), [ownedTokens, search]);
  const filteredCommon = useMemo(() => filterTokens(commonTokens, search), [commonTokens, search]);

  const hasAnyResults =
    filteredSV.length > 0 || filteredOwned.length > 0 || filteredCommon.length > 0;

  function handleSelect(mint: string) {
    onSelectToken(mint);
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-surface p-0 shadow-xl">
          <Dialog.Title className="sr-only">Select Token</Dialog.Title>
          <div className="flex max-h-[32rem] flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-base font-semibold">Select Token</h2>
              <Dialog.Close
                className="rounded-lg p-1 text-muted transition-colors hover:bg-field"
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Dialog.Close>
            </div>

            {/* Search */}
            <div className="px-4 py-3">
              <Input
                placeholder="Search by name, symbol, or address"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            {/* Token sections */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {!hasAnyResults && search && !loading ? (
                <p className="px-2 py-4 text-center text-sm text-muted">
                  No tokens match your search
                </p>
              ) : (
                <>
                  {filteredSV.length > 0 && (
                    <div className="mb-2">
                      <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                        Your SimplyVest Tokens
                      </p>
                      {filteredSV.map((t) => (
                        <TokenRow
                          key={t.mint}
                          name={t.name}
                          symbol={t.symbol}
                          mintAddress={t.mint}
                          balance={formatBalance(t.balance, t.decimals)}
                          iconUrl={t.iconUrl}
                          isSVToken
                          isSelected={t.mint === selectedMint}
                          onClick={() => handleSelect(t.mint)}
                        />
                      ))}
                    </div>
                  )}

                  {filteredOwned.length > 0 && (
                    <div className="mb-2">
                      <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                        My Tokens
                      </p>
                      {filteredOwned.map((t) => (
                        <TokenRow
                          key={t.mint}
                          name={t.name}
                          symbol={t.symbol}
                          mintAddress={t.mint}
                          balance={formatBalance(t.balance, t.decimals)}
                          iconUrl={t.iconUrl}
                          isSelected={t.mint === selectedMint}
                          onClick={() => handleSelect(t.mint)}
                        />
                      ))}
                    </div>
                  )}

                  {loading && svTokens.length === 0 && ownedTokens.length === 0 && (
                    <div className="mb-2">
                      <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                        My Tokens
                      </p>
                      <div className="space-y-2 px-1 py-1">
                        {SKELETON_IDS.map((id) => (
                          <div key={id} className="flex animate-pulse items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-field" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3.5 w-24 rounded bg-field" />
                              <div className="h-3 w-12 rounded bg-field" />
                            </div>
                            <div className="h-3.5 w-16 rounded bg-field" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!loading &&
                    svTokens.length === 0 &&
                    ownedTokens.length === 0 &&
                    commonTokens.length === 0 && (
                      <div className="mb-2">
                        <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                          My Tokens
                        </p>
                        <p className="px-3 py-2 text-sm text-muted">
                          No tokens found.{" "}
                          <a href="/app/tools/create-token" className="text-sol underline">
                            Create one in Tools
                          </a>
                        </p>
                      </div>
                    )}

                  {filteredCommon.length > 0 && (
                    <div>
                      <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                        Common Tokens
                      </p>
                      {filteredCommon.map((t) => (
                        <TokenRow
                          key={t.mint}
                          name={t.name}
                          symbol={t.symbol}
                          mintAddress={t.mint}
                          iconUrl={t.iconUrl}
                          isSelected={t.mint === selectedMint}
                          onClick={() => handleSelect(t.mint)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Custom mint input */}
            <div className="border-t px-4 py-3">
              <p className="mb-2 text-xs text-muted">Or paste a mint address:</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter SPL token mint address"
                  value={customMint}
                  onChange={(e) => setCustomMint(e.target.value)}
                  invalid={!!customError}
                  className="flex-1"
                />
                {customLabel && !customLoading && (
                  <Button type="button" size="sm" onClick={() => handleSelect(customMint.trim())}>
                    Use this token
                  </Button>
                )}
              </div>
              {customLoading && (
                <p className="mt-1 animate-pulse text-xs text-muted">Resolving token…</p>
              )}
              {customError && <p className="mt-1 text-xs text-warn">{customError}</p>}
              {customLabel && !customLoading && (
                <p className="mt-1 text-xs text-muted">{customLabel}</p>
              )}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
