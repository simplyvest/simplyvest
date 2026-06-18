import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useApiStreams } from "@/hooks/use-api";
import type { Organization } from "@/hooks/use-api";

import { OrgTokenCard } from "./org-token-card";
import { OrgTokenStats } from "./org-token-stats";
import { OrgVestList } from "./org-vest-list";
import { VestToMemberModal } from "./vest-to-member-modal";

interface OrgDashboardProps {
  org: Organization;
  currentUserRole: string | undefined;
}

export function OrgDashboard({ org, currentUserRole }: OrgDashboardProps) {
  const [showVest, setShowVest] = useState(false);
  const { data: streams = [] } = useApiStreams({ org: org.id });

  const tokenStreams = org.mintAddress
    ? streams.filter((s) => s.mintAddress === org.mintAddress)
    : [];

  const isOwner = currentUserRole === "owner";
  const hasToken = !!org.mintAddress;

  return (
    <div className="space-y-4">
      <OrgTokenCard org={org} currentUserRole={currentUserRole} />

      {hasToken && (
        <>
          <OrgTokenStats
            streams={tokenStreams}
            tokenDecimals={org.tokenDecimals ?? 9}
            tokenSymbol={org.tokenSymbol ?? ""}
          />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Vesting Activity</h2>
            {isOwner && (
              <Button size="sm" onClick={() => setShowVest(true)}>
                Vest to Member
              </Button>
            )}
          </div>

          <OrgVestList streams={tokenStreams} tokenDecimals={org.tokenDecimals ?? 9} />

          {showVest && org.mintAddress && (
            <VestToMemberModal
              orgId={org.id}
              mintAddress={org.mintAddress}
              tokenSymbol={org.tokenSymbol ?? ""}
              tokenDecimals={org.tokenDecimals ?? 9}
              onClose={() => setShowVest(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
