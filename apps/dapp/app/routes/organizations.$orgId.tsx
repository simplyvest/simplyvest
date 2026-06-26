import { createRoute, Outlet, useRouterState } from "@tanstack/react-router";

import { OrgDetail } from "@/components/orgs/org-detail";

import { Route as OrganizationsRoute } from "./organizations";

export const Route = createRoute({
  getParentRoute: () => OrganizationsRoute,
  path: "/$orgId",
  component: OrgDetailPage,
});

function OrgDetailPage() {
  const { orgId } = Route.useParams();
  const location = useRouterState().location;

  const isExactOrg = location.pathname === `/organizations/${orgId}`;

  if (!isExactOrg) {
    return <Outlet />;
  }

  return <OrgDetail orgId={orgId} />;
}
