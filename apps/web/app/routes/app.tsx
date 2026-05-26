import { Outlet, createRoute, Link, useRouterState } from "@tanstack/react-router";
import { WalletButton } from "@/components/solana/wallet-button";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/app",
  component: AppLayout,
});

function AppLayout() {
  const routerState = useRouterState();
  const location = routerState.location;

  const tabs = [
    { path: "/app/dashboard", label: "Dashboard" },
    { path: "/app/create", label: "Create Stream" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-6 pt-8">
      <nav className="mb-8 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight no-underline hover:no-underline"
          >
            <img src="/simplyvest.png" alt="SimplyVest" className="h-6 w-auto" />
            SimplyVest
          </Link>
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium no-underline transition-colors hover:no-underline ${
                    isActive
                      ? "bg-sol/15 text-sol"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
        <WalletButton />
      </nav>
      <Outlet />
    </div>
  );
}
