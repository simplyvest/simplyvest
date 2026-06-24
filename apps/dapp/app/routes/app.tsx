import { createRoute, redirect } from "@tanstack/react-router";

import { AppLayout } from "@/components/layout/app-layout";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/app",
  component: AppLayout,
  beforeLoad: ({ location }) => {
    if (location.pathname === "/app") {
      throw redirect({ to: "/app/dashboard", search: { tab: "created" }, replace: true });
    }
  },
});
