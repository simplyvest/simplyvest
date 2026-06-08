import { createRoute, Link } from "@tanstack/react-router";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/help",
  component: HelpPage,
});

function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Help & Support</h1>
        <p className="mt-1 text-sm text-muted">Get help with SimplyVest</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/docs"
          className="rounded-lg border border-border bg-bg1 p-6 transition-colors hover:border-sol/30 hover:bg-bg2 no-underline hover:no-underline"
        >
          <h3 className="text-base font-semibold text-text">Documentation</h3>
          <p className="mt-1 text-sm text-muted">Learn how to use SimplyVest</p>
        </Link>

        <Link
          to="/faq"
          className="rounded-lg border border-border bg-bg1 p-6 transition-colors hover:border-sol/30 hover:bg-bg2 no-underline hover:no-underline"
        >
          <h3 className="text-base font-semibold text-text">FAQ</h3>
          <p className="mt-1 text-sm text-muted">Frequently asked questions</p>
        </Link>
      </div>
    </div>
  );
}
