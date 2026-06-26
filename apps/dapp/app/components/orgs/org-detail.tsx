import { Link } from "@tanstack/react-router";
import { LuArrowLeft, LuSettings } from "react-icons/lu";

import { LinkButton } from "@/components/ui/link-button";
import { useOrg } from "@/hooks/use-org-api";
import { useAuth } from "@/lib/solana/use-auth";

import { AddMemberForm } from "./add-member-form";
import { MemberList } from "./member-list";
import { OrgDashboard } from "./org-dashboard";

interface OrgDetailProps {
  orgId: string;
}

export function OrgDetail({ orgId }: OrgDetailProps) {
  const { data: org, isLoading, error } = useOrg(orgId);
  const { publicKey, privyId } = useAuth();

  const walletMatch = publicKey?.toBase58() ?? null;
  const currentUserRole = org?.members.find(
    (m) => (walletMatch && m.walletAddress === walletMatch) || (privyId && m.privyId === privyId),
  )?.role;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-bg2" />
        <div className="h-64 animate-pulse rounded-xl bg-bg2" />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="rounded-xl border border-border bg-bg1 p-8 text-center">
        <p className="text-sm text-muted">Organization not found</p>
        <Link
          to="/organizations"
          className="mt-2 inline-block text-sm text-primary hover:underline no-underline"
        >
          Back to organizations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/organizations"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text no-underline hover:no-underline mb-4"
        >
          <LuArrowLeft className="h-3.5 w-3.5" />
          Back to Organizations
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">{org.name}</h1>
            {org.description && <p className="mt-1 text-sm text-muted">{org.description}</p>}
            <p className="mt-1 text-sm text-dim">
              /{org.slug} · <span className="capitalize">{currentUserRole ?? "viewer"}</span>
            </p>
          </div>
          {(currentUserRole === "owner" || currentUserRole === "admin") && (
            <LinkButton
              to="/organizations/$orgId/edit"
              params={{ orgId }}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <LuSettings className="h-4 w-4" />
              Settings
            </LinkButton>
          )}
        </div>
      </div>

      <OrgDashboard org={org} currentUserRole={currentUserRole} />

      {(currentUserRole === "owner" || currentUserRole === "admin") && (
        <AddMemberForm orgId={orgId} currentUserRole={currentUserRole} />
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text">Members</h2>
        </div>
        <MemberList orgId={orgId} members={org.members} currentUserRole={currentUserRole} />
      </div>
    </div>
  );
}
