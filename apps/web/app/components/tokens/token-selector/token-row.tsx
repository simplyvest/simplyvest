import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

export type TokenRowProps = {
  name: string;
  symbol: string;
  mintAddress: string;
  balance?: string;
  iconUrl?: string;
  isSVToken?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
};

function TokenIcon({ name, iconUrl }: { name: string; iconUrl?: string }) {
  const [imgError, setImgError] = useState(false);

  if (iconUrl && !imgError) {
    return (
      <img
        src={iconUrl}
        alt={name}
        className="h-7 w-7 rounded-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bg2 text-xs font-semibold text-muted">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function TokenRow({
  name,
  symbol,
  mintAddress,
  balance,
  iconUrl,
  isSVToken,
  isSelected,
  onClick,
}: TokenRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-mint-address={mintAddress}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-bg2",
        isSelected && "ring-1 ring-primary",
      )}
    >
      <TokenIcon name={name} iconUrl={iconUrl} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{name}</span>
          {isSVToken && <Badge variant="success">SV</Badge>}
        </div>
        <span className="text-xs text-muted">{symbol}</span>
      </div>
      {balance !== undefined && (
        <span className="shrink-0 text-sm tabular-nums text-muted">{balance}</span>
      )}
    </button>
  );
}
