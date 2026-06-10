import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";

import { Route as ToolsRoute } from "./app.tools";

const CreateTokenPage = lazy(() =>
  import("./_tools/-create-token-page").then((m) => ({
    default: m.CreateTokenPage,
  })),
);

export const Route = createRoute({
  getParentRoute: () => ToolsRoute,
  path: "/create-token",
  validateSearch: (input: Record<string, unknown>): { mode?: "platform" | "wallet" } => {
    const mode = input.mode === "platform" || input.mode === "wallet" ? input.mode : undefined;
    return { mode };
  },
  component: CreateTokenPage,
});
