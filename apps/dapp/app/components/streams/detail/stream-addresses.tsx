import { formatAddress } from "@solana-tdp/sdk";

import type { StreamDetail } from "@/hooks/use-stream-detail";

interface AddressRowProps {
  label: string;
  address: string;
}

function AddressRow({ label, address }: AddressRowProps) {
  const explorerUrl = `https://explorer.solana.com/address/${address}?cluster=devnet`;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-dim">{label}</p>
        <p className="font-mono text-sm text-text truncate">{formatAddress(address)}</p>
      </div>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-xs text-dim hover:text-text"
      >
        Explorer
      </a>
    </div>
  );
}

export function StreamAddresses({ detail }: { detail: StreamDetail }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text">Addresses</h3>
      <div className="space-y-2.5">
        <AddressRow label="Stream PDA" address={detail.pda} />
        <AddressRow label="Creator" address={detail.creator} />
        <AddressRow label="Recipient" address={detail.recipient} />
        <AddressRow label="Token Mint" address={detail.mint} />
        <AddressRow label="Vault" address={detail.vault} />
        {detail.milestoneAuthority && (
          <AddressRow label="Milestone Authority" address={detail.milestoneAuthority} />
        )}
      </div>
    </div>
  );
}
