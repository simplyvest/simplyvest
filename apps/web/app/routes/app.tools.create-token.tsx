import { createRoute, Outlet, useRouterState } from "@tanstack/react-router";

import { TokenCreateSelector } from "@/components/tools/token-create-selector";

import { Route as ToolsRoute } from "./app.tools";

export const Route = createRoute({
  getParentRoute: () => ToolsRoute,
  path: "/create-token",
  component: CreateTokenPage,
});

function CreateTokenPage() {
  const location = useRouterState().location;
  const isExactCreateToken = location.pathname === "/app/tools/create-token";

  if (!isExactCreateToken) {
    return <Outlet />;
  }

  return <TokenCreateSelector />;
}
