import { useLogin } from "@privy-io/react-auth";
import { Outlet } from "@tanstack/react-router";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/solana/use-auth";

import { Sidebar } from "./sidebar";
import { MobileDrawer } from "./sidebar/mobile-drawer";
import { TopBar } from "./top-bar";

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

export function AppLayout() {
  const { connected, connecting } = useAuth();
  const { login } = useLogin();
  const [collapsed, toggleCollapse] = useSidebarCollapsed();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const showContent = connected && !connecting;

  if (!showContent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-8 text-center px-6">
          <div className="rounded-2xl border border-sol/20 bg-sol/5 p-6">
            <svg
              className="h-12 w-12 text-sol"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text">Log In to Continue</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              To use the SimplyVest app, log in with your email, Google, or connect a wallet on{" "}
              <span className="font-mono text-sol">Solana devnet</span>.
            </p>
          </div>
          <Button
            variant="default"
            size="lg"
            className="min-w-[200px]"
            onClick={() => login({ loginMethods: ["email", "google", "wallet"] })}
            disabled={connecting}
          >
            {connecting ? "Loading..." : "Log In"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar onMobileMenuToggle={() => setMobileOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
