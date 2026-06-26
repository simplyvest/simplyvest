import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";

import { Route as CreateTokenRoute } from "./tools.create-token";

const WalletFlow = lazy(() =>
  import("./_tools/-create-token-wallet").then((m) => ({
    default: m.CreateTokenWallet,
  })),
);

export const Route = createRoute({
  getParentRoute: () => CreateTokenRoute,
  path: "/wallet",
  component: WalletFlow,
});
