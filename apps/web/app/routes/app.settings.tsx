import { createRoute, redirect } from "@tanstack/react-router";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/settings",
  beforeLoad: () => {
    throw redirect({ to: "/app/profile", replace: true });
  },
});
