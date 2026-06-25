import { createRoute } from "@tanstack/react-router";

import { AppLayout } from "@/components/layout/app-layout";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/app",
  component: AppLayout,
});
