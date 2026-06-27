import { Button } from "@simplyvest/ui/button";
import { Link } from "@tanstack/react-router";

import type { Organization } from "@/hooks/use-org-api";
import { useApiStreams } from "@/hooks/use-stream-api";

import { OrgTokenCard } from "./org-token-card";
import { OrgTokenStats } from "./org-token-stats";
import { OrgVestList } from "./org-vest-list";

interface OrgDashboardProps {
  org: Organization;
  currentUserRole: string | undefined;
}

export function OrgDashboard({ org, currentUserRole }: OrgDashboardProps) {
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
              <Link to="/organizations/$orgId/vest" params={{ orgId: org.id }}>
                <Button size="sm">Vest to Member</Button>
              </Link>
            )}
          </div>

          <OrgVestList streams={tokenStreams} tokenDecimals={org.tokenDecimals ?? 9} />
        </>
      )}
    </div>
  );
}
