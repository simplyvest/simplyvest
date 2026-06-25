import { createRoute, redirect } from "@tanstack/react-router";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  loader: () => {
    throw redirect({ to: "/app", search: { tab: "created" } });
  },
});
