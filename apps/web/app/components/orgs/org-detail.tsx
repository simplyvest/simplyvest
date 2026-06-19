import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { LuArrowLeft } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { useOrg } from "@/hooks/use-api";
import { useAuth } from "@/lib/solana/use-auth";

import { AddMemberForm } from "./add-member-form";
import { EditOrgForm } from "./edit-org-form";
import { MemberList } from "./member-list";
import { OrgDashboard } from "./org-dashboard";

interface OrgDetailProps {
  orgId: string;
}

export function OrgDetail({ orgId }: OrgDetailProps) {
  const { data: org, isLoading, error } = useOrg(orgId);
  const { publicKey } = useAuth();
  const [editing, setEditing] = useState(false);

  const currentUserRole = org?.members.find((m) => m.walletAddress === publicKey?.toBase58())?.role;

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
          to="/app/organizations"
          className="mt-2 inline-block text-sm text-sol hover:underline no-underline"
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
          to="/app/organizations"
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
            <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
              {editing ? "Close" : "Edit"}
            </Button>
          )}
        </div>
      </div>

      {editing && (currentUserRole === "owner" || currentUserRole === "admin") && (
        <EditOrgForm
          orgId={orgId}
          currentName={org.name}
          currentSlug={org.slug}
          currentDescription={org.description}
          onSuccess={() => setEditing(false)}
        />
      )}

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
