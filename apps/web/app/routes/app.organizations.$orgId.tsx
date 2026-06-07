import { createRoute } from "@tanstack/react-router";

import { OrgDetail } from "@/components/orgs/org-detail";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/organizations/$orgId",
  component: OrgDetailPage,
});

function OrgDetailPage() {
  const { orgId } = Route.useParams();

  return <OrgDetail orgId={orgId} />;
}
