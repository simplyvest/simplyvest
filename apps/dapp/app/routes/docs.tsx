import { createRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { Route as RootRoute } from "./__root";

const DOCS_URL = import.meta.env.VITE_DOCS_URL ?? "https://docs.simplyvest.xyz";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/docs",
  component: DocsRedirect,
});

function DocsRedirect() {
  useEffect(() => {
    window.location.href = DOCS_URL;
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900">
      <p className="text-gray-500 dark:text-slate-400">
        Redirecting to{" "}
        <a href={DOCS_URL} className="text-purple-600 hover:text-purple-500 underline">
          SimplyVest Docs
        </a>
        ...
      </p>
    </div>
  );
}
