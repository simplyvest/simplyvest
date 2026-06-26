import { useLogin } from "@privy-io/react-auth";
import { Button } from "@simplyvest/ui/button";
import { ErrorBoundary } from "@simplyvest/ui/error-boundary";
import { ThemeProvider } from "@simplyvest/ui/theme";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import * as React from "react";
import { Toaster } from "sonner";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileDrawer } from "@/components/layout/sidebar/mobile-drawer";
import { TopBar } from "@/components/layout/top-bar";
import { SolanaProvider } from "@/lib/solana/solana-provider";
import { useAuth } from "@/lib/solana/use-auth";
import { trackPageView } from "@/utils/analytics";

const DEV = import.meta.env.DEV;
const STORAGE_KEY = "sidebar-collapsed";

function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return [collapsed, toggle] as const;
}

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
          to="/"
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
  const { connected } = useAuth();
  const { login } = useLogin();
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  if (!connected) {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SolanaProvider>
            <ThemeProvider>
              <div className="flex min-h-screen items-center justify-center bg-bg p-4">
                <div className="flex flex-col items-center gap-4 text-center">
                  <img src="/logo.png" alt="SimplyVest" className="h-12 w-12" />
                  <h1 className="text-2xl font-semibold tracking-tight text-text">SimplyVest</h1>
                  <p className="max-w-sm text-sm text-muted">
                    Connect your wallet to manage vesting streams and organizations.
                  </p>
                  <Button
                    onClick={login}
                    size="lg"
                    className="mt-2 min-w-[200px] rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600"
                  >
                    Connect Wallet
                  </Button>
                </div>
              </div>
            </ThemeProvider>
            <Toaster richColors />
          </SolanaProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SolanaProvider>
          <ThemeProvider>
            <div className="flex h-screen overflow-hidden bg-bg">
              <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

              <Sidebar collapsed={collapsed} />

              <div className="flex flex-1 flex-col overflow-hidden">
                <TopBar
                  onMenuClick={() => setMobileOpen(true)}
                  onCollapse={toggleCollapsed}
                  collapsed={collapsed}
                />

                <main className="flex-1 overflow-y-auto p-6">
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:no-underline"
                  >
                    Skip to main content
                  </a>
                  <div id="main-content">
                    <Outlet />
                  </div>
                </main>
              </div>
            </div>

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
          </ThemeProvider>
          <Toaster richColors />
        </SolanaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
