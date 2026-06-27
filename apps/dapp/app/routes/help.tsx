import { createRoute } from "@tanstack/react-router";

import { DOCS_URL, FAQ_PATH } from "../lib/constants";
import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/help",
  component: HelpPage,
});

function HelpPage() {
  const docsUrl = import.meta.env.VITE_DOCS_URL ?? DOCS_URL;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Help & Support</h1>
        <p className="mt-1 text-sm text-muted">Get help with SimplyVest</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={docsUrl}
          className="rounded-lg border border-border bg-bg1 p-6 transition-colors hover:border-primary/30 hover:bg-bg2 no-underline block"
        >
          <h3 className="text-base font-semibold text-text">Documentation</h3>
          <p className="mt-1 text-sm text-muted">Guides, reference, and tutorials</p>
        </a>

        <a
          href={`${docsUrl}${FAQ_PATH}`}
          className="rounded-lg border border-border bg-bg1 p-6 transition-colors hover:border-primary/30 hover:bg-bg2 no-underline block"
        >
          <h3 className="text-base font-semibold text-text">FAQ</h3>
          <p className="mt-1 text-sm text-muted">Frequently asked questions and troubleshooting</p>
        </a>
      </div>
    </div>
  );
}
