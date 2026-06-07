import { createRoute } from "@tanstack/react-router";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Analytics</h1>
        <p className="mt-1 text-sm text-muted">Portfolio overview and stream metrics</p>
      </div>

      <div className="rounded-lg border border-border bg-bg1 p-8 text-center">
        <p className="text-sm text-muted">Analytics dashboard coming soon</p>
      </div>
    </div>
  );
}
