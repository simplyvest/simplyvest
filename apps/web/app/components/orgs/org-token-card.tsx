import { useState } from "react";
import { LuExternalLink } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import type { Organization } from "@/hooks/use-org-api";
import { useRemoveOrgToken } from "@/hooks/use-org-api";

import { CreateOrgTokenModal } from "./create-org-token-modal";
import { LinkOrgTokenModal } from "./link-org-token-modal";

interface OrgTokenCardProps {
  org: Organization;
  currentUserRole: string | undefined;
}

export function OrgTokenCard({ org, currentUserRole }: OrgTokenCardProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const removeToken = useRemoveOrgToken(org.id);

  const isOwner = currentUserRole === "owner";
  const hasToken = !!org.mintAddress;

  if (!hasToken) {
    return (
      <>
        <div className="rounded-xl border border-dashed border-border2 bg-bg1 p-6 text-center">
          <p className="text-sm font-semibold text-text">No Token Attached</p>
          <p className="mt-1 text-xs text-muted">
            Create or link an equity token for this organization
          </p>
          {isOwner && (
            <div className="mt-4 flex justify-center gap-3">
              <Button size="sm" onClick={() => setShowCreate(true)}>
                Create Token
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowLink(true)}>
                Link Existing
              </Button>
            </div>
          )}
          {!isOwner && (
            <p className="mt-3 text-xs text-dim">This organization has no equity token yet</p>
          )}
        </div>
        {showCreate && <CreateOrgTokenModal orgId={org.id} onClose={() => setShowCreate(false)} />}
        {showLink && <LinkOrgTokenModal orgId={org.id} onClose={() => setShowLink(false)} />}
      </>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg1 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-text">Equity Token</span>
        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeToken.mutate()}
            disabled={removeToken.isPending}
          >
            {removeToken.isPending ? "Removing..." : "Remove"}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg2 text-base font-bold text-text">
          {(org.tokenName ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text">
            {org.tokenName ?? "Unknown Token"}{" "}
            <span className="text-xs text-muted">{org.tokenSymbol ?? ""}</span>
          </p>
          <p className="text-xs text-dim font-mono truncate">
            {org.mintAddress?.slice(0, 6)}...{org.mintAddress?.slice(-6)}
            {" · "}
            {org.tokenDecimals ?? 9} decimals
          </p>
        </div>
        <a
          href={`https://explorer.solana.com/address/${org.mintAddress}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-text"
        >
          <LuExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
