import { createRoute, Outlet, useRouterState } from "@tanstack/react-router";

import { TokenCreateSelector } from "@/components/tools/token-create-selector";

import { Route as ToolsRoute } from "./tools";

export const Route = createRoute({
  getParentRoute: () => ToolsRoute,
  path: "/create-token",
  component: CreateTokenPage,
});

function CreateTokenPage() {
  const location = useRouterState().location;
  const isExactCreateToken = location.pathname === "/tools/create-token";

  if (!isExactCreateToken) {
    return <Outlet />;
  }

  return <TokenCreateSelector />;
}
