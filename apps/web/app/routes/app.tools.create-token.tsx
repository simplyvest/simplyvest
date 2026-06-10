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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text">Create Token</h1>
        <p className="mt-1 text-sm text-muted">Choose how you want to create your token</p>
      </div>
      <TokenCreateSelector />
    </div>
  );
}
