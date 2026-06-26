import { Button } from "@simplyvest/ui/button";
import { useNavigate, createRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { CreateOrgModal } from "@/components/orgs/create-org-modal";
import { OrgList } from "@/components/orgs/org-list";
import { useUserOrgs } from "@/hooks/use-org-api";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/organizations",
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const navigate = useNavigate();
  const location = useRouterState().location;
  const { data: orgs, isLoading } = useUserOrgs();
  const [createOpen, setCreateOpen] = useState(false);

  const isExactOrgs = location.pathname === "/organizations";
  const hasOrgs = orgs && orgs.length > 0;

  return (
    <div className="space-y-6">
      {isExactOrgs ? (
        <>
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
              void navigate({ to: "/organizations/$orgId", params: { orgId } });
            }}
          />
        </>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
