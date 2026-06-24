import { createRoute, Outlet } from "@tanstack/react-router";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/tools",
  component: ToolsLayout,
});

function ToolsLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Token Tools</h1>
        <p className="mt-1 text-muted">Create and manage tokens for vesting</p>
      </div>
      <Outlet />
    </div>
  );
}
