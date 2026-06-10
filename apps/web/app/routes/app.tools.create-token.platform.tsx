import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";

import { Route as CreateTokenRoute } from "./app.tools.create-token";

const PlatformFlow = lazy(() =>
  import("./_tools/-create-token-platform").then((m) => ({
    default: m.CreateTokenPlatform,
  })),
);

export const Route = createRoute({
  getParentRoute: () => CreateTokenRoute,
  path: "/platform",
  component: PlatformFlow,
});
