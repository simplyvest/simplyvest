import { useMemo } from "react";

import { COMMON_TOKENS } from "@/components/tokens/token-selector/common-tokens";
import type { PickerToken } from "@/components/tokens/token-selector/token-picker-dialog";
import { TokenPickerDialog } from "@/components/tokens/token-selector/token-picker-dialog";
import { useOwnedTokens } from "@/components/tokens/token-selector/use-owned-tokens";
import { useUpdateOrgToken } from "@/hooks/use-org-api";
import { useTokenList } from "@/hooks/use-token-list";

interface LinkOrgTokenModalProps {
  orgId: string;
  onClose: () => void;
}

export function LinkOrgTokenModal({ orgId, onClose }: LinkOrgTokenModalProps) {
  const updateToken = useUpdateOrgToken(orgId);
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
    return COMMON_TOKENS.filter((c) => !ownedMints.has(c.mint)).map(
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

  function handleSelectToken(mint: string) {
    const all = [...svTokens, ...ownedTokens, ...commonTokens];
    const token = all.find((t) => t.mint === mint);

    updateToken.mutate(
      {
        action: "link",
        mintAddress: mint,
        tokenName: token?.name ?? null,
        tokenSymbol: token?.symbol ?? null,
        tokenDecimals: token?.decimals ?? 9,
      },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <TokenPickerDialog
      open
      onOpenChange={(open) => !open && onClose()}
      svTokens={svTokens}
      ownedTokens={ownedTokens}
      commonTokens={commonTokens}
      loading={loading}
      selectedMint=""
      onSelectToken={handleSelectToken}
    />
  );
}
