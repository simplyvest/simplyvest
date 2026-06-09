import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";

import { Route as ToolsRoute } from "./app.tools";

const TokensPage = lazy(() =>
  import("./_tools/tokens-page").then((m) => ({
    default: m.TokensPage,
  })),
);

export const Route = createRoute({
  getParentRoute: () => ToolsRoute,
  path: "/tokens",
  component: TokensPage,
});
