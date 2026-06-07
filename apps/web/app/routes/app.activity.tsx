import { createRoute } from "@tanstack/react-router";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/activity",
  component: ActivityPage,
});

function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Activity</h1>
        <p className="mt-1 text-sm text-muted">View your stream event history</p>
      </div>

      <div className="rounded-lg border border-border bg-bg1 p-8 text-center">
        <p className="text-sm text-muted">Activity history coming soon</p>
      </div>
    </div>
  );
}
