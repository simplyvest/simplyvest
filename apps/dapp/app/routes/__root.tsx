import { ErrorBoundary } from "@simplyvest/ui/error-boundary";
import { ThemeProvider } from "@simplyvest/ui/theme";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import * as React from "react";
import { Toaster } from "sonner";

import { SolanaProvider } from "@/lib/solana/solana-provider";
import { trackPageView } from "@/utils/analytics";

const DEV = import.meta.env.DEV;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchInterval: 30_000,
    },
  },
});

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">404</h1>
        <p className="mt-2 text-muted">Page not found.</p>
        <Link
          to="/app/dashboard"
          search={{ tab: "created" }}
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  ),
});

function RootComponent() {
  const routerState = useRouterState();
  const location = routerState.location;

  React.useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SolanaProvider>
          <ThemeProvider>
            <div className="flex min-h-screen flex-col bg-bg text-text">
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:no-underline"
              >
                Skip to main content
              </a>

              <main id="main-content" className="flex-1">
                <Outlet />
              </main>

              {DEV && (
                <TanStackDevtools
                  plugins={[
                    { name: "TanStack Query", render: <ReactQueryDevtoolsPanel /> },
                    {
                      name: "TanStack Router",
                      render: <TanStackRouterDevtoolsPanel />,
                    },
                  ]}
                />
              )}
            </div>
          </ThemeProvider>
          <Toaster richColors />
        </SolanaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
