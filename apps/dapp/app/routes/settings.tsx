import { createRoute, redirect } from "@tanstack/react-router";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/settings",
  beforeLoad: () => {
    throw redirect({ to: "/profile", replace: true });
  },
});
