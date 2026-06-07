import { createRoute } from "@tanstack/react-router";

import { OrgList } from "@/components/orgs/org-list";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/organizations",
  component: OrganizationsPage,
});

function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Organizations</h1>
        <p className="mt-1 text-sm text-muted">Manage your organizations and teams</p>
      </div>
      <OrgList />
    </div>
  );
}
