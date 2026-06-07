import { useState } from "react";
import { useNavigate, createRoute } from "@tanstack/react-router";

import { useUserOrgs } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { OrgList } from "@/components/orgs/org-list";
import { CreateOrgModal } from "@/components/orgs/create-org-modal";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/organizations",
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const navigate = useNavigate();
  const { data: orgs, isLoading } = useUserOrgs();
  const [createOpen, setCreateOpen] = useState(false);

  const hasOrgs = orgs && orgs.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Organizations</h1>
          <p className="mt-1 text-sm text-muted">Manage your organizations and teams</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ Create Organization</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-bg2" />
          ))}
        </div>
      ) : hasOrgs ? (
        <OrgList />
      ) : (
        <div className="rounded-xl border border-border bg-bg1 p-12 text-center">
          <p className="text-muted">No organizations yet</p>
          <Button onClick={() => setCreateOpen(true)} className="mt-4">
            Create Your First Organization
          </Button>
        </div>
      )}

      <CreateOrgModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={(orgId) => {
          setCreateOpen(false);
          void navigate({ to: "/app/organizations/$orgId", params: { orgId } });
        }}
      />
    </div>
  );
}
