import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LuEye, LuEyeOff, LuPlus } from "react-icons/lu";

import {
  useOwnedTokens,
  type TokenInfo,
} from "@/components/tokens/token-selector/use-owned-tokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTokenList } from "@/hooks/use-token-list";
import { useTokenPreferences } from "@/hooks/use-token-preferences";

type FilterTab = "all" | "visible" | "hidden";

export function TokenList() {
  const { tokens: ownedTokens, loading: ownerLoading } = useOwnedTokens();
  const { data: apiTokens = [] } = useTokenList();
  const { preferences, setVisibility } = useTokenPreferences();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<FilterTab>("all");

  const createdHereMap = new Map(apiTokens.map((t) => [t.mintAddress, t]));
  const visibilityMap = new Map(preferences.preferences.map((p) => [p.mintAddress, p.visible]));

  function isHidden(mintAddress: string): boolean {
    const v = visibilityMap.get(mintAddress);
    if (v !== undefined) return !v;
    const record = createdHereMap.get(mintAddress);
    if (!record) return false;
    return record.visible === false;
  }

  let filtered: (TokenInfo & { apiRecord?: (typeof apiTokens)[number] })[] = ownedTokens.map(
    (t) => ({
      ...t,
      apiRecord: createdHereMap.get(t.mint.toBase58()),
    }),
  );

  if (filter === "visible") {
    filtered = filtered.filter((t) => !isHidden(t.mint.toBase58()));
  } else if (filter === "hidden") {
    filtered = filtered.filter((t) => isHidden(t.mint.toBase58()));
  }

  if (ownerLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-bg2" />
        ))}
      </div>
    );
  }

  if (ownedTokens.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">No tokens found in wallet</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate({ to: "/app/tools/create-token" })}
        >
          <LuPlus className="mr-2 h-4 w-4" />
          Create your first token
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(["all", "visible", "hidden"] as const).map((tab) => (
          <Button
            key={tab}
            variant={filter === tab ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(tab)}
          >
            {tab === "all" ? "All" : tab === "visible" ? "Visible" : "Hidden"}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-muted">No tokens match this filter</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
            const mintStr = t.mint.toBase58();
            const record = t.apiRecord;
            const hidden = isHidden(mintStr);
            const name =
              t.meta?.name ?? record?.name ?? mintStr.slice(0, 4) + "..." + mintStr.slice(-4);
            const symbol = t.meta?.symbol ?? record?.symbol ?? "";

            return (
              <div
                key={mintStr}
                className="flex items-center gap-4 rounded-xl border border-border bg-bg1 p-4 cursor-pointer hover:border-border2 transition-colors"
                onClick={() =>
                  navigate({
                    to: "/app/create",
                    search: { mint: mintStr },
                  })
                }
              >
                <div className="h-10 w-10 rounded-full bg-bg2 flex items-center justify-center text-sm font-bold text-muted">
                  {symbol ? symbol[0] : "?"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text truncate">{name}</p>
                    {symbol && <span className="text-sm text-dim shrink-0">{symbol}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-dim truncate">
                      {mintStr.slice(0, 4)}...{mintStr.slice(-4)}
                    </p>
                    {record?.created_here ? (
                      <Badge variant="sol">Created</Badge>
                    ) : (
                      <Badge variant="sol2">External</Badge>
                    )}
                    {hidden && <Badge variant="sol3">Hidden</Badge>}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibility.mutate({
                      mintAddress: mintStr,
                      visible: hidden,
                    });
                  }}
                >
                  {hidden ? <LuEye className="h-4 w-4" /> : <LuEyeOff className="h-4 w-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
