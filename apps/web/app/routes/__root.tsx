import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { Outlet, createRootRoute, Link, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import * as React from "react";
import { Toaster } from "sonner";

import { SolanaProvider } from "@/components/solana/solana-provider";
import { trackPageView } from "@/utils/analytics";

const DEV = import.meta.env.DEV;
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

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
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-sol hover:underline">
          Go home
        </Link>
      </div>
    </div>
  ),
});

function RootComponent() {
  const routerState = useRouterState();
  const location = routerState.location;
  const isAppRoute = location.pathname.startsWith("/app");
  const isLoading = routerState.status === "pending";

  React.useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider>
        <div className="flex min-h-screen flex-col bg-bg text-text">
          {isAppRoute ? (
            <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur">
              <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
                <Link
                  to="/"
                  className="flex items-center gap-2.5 text-lg font-semibold tracking-tight no-underline hover:no-underline"
                >
                  <div className="flex items-center gap-2.5 rounded-md bg-sol p-1.5 dark:bg-transparent">
                    <img src="/simplyvest.png" alt="SimplyVest" className="h-6 w-auto" />
                  </div>
                  SimplyVest
                </Link>
              </div>
            </header>
          ) : (
            <Header />
          )}

          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-sol focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:no-underline"
          >
            Skip to main content
          </a>

          <main id="main-content" className="flex-1">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-sol border-t-transparent" />
              </div>
            ) : (
              <Outlet />
            )}
          </main>

          {!isAppRoute && <Footer />}

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
        <Toaster richColors />
      </SolanaProvider>
    </QueryClientProvider>
  );
}
