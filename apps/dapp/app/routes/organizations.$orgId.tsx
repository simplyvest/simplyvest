import { createRoute } from "@tanstack/react-router";

import { OrgDetail } from "@/components/orgs/org-detail";

import { Route as OrganizationsRoute } from "./organizations";

export const Route = createRoute({
  getParentRoute: () => OrganizationsRoute,
  path: "/$orgId",
  component: OrgDetailPage,
});

function OrgDetailPage() {
  const { orgId } = Route.useParams();

  return <OrgDetail orgId={orgId} />;
}
