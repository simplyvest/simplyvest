import { useAuth } from "@/lib/solana/use-auth";
import { Link, useRouterState } from "@tanstack/react-router";
import * as React from "react";

import { AuthButton } from "@/components/solana/wallet-button";
import { LinkButton } from "@/components/ui/link-button";

import { HamburgerButton } from "./navbar/hamburger-button";
import { MobileMenu } from "./navbar/mobile-menu";
import { NavLinks } from "./navbar/nav-links";
import { ThemeToggle } from "./navbar/theme-toggle";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/docs", label: "Docs" },
  { to: "/faq", label: "FAQ" },
  { to: "/waitlist", label: "Waitlist" },
];

const appLinks = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/create", label: "Create Stream" },
  { to: "/app/settings", label: "Settings" },
];

export function Navbar() {
  const { publicKey } = useAuth();
  const { location } = useRouterState();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isApp = location.pathname.startsWith("/app") && !!publicKey;
  const links = isApp ? appLinks : publicLinks;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 px-6 pt-4">
      <div className="mx-auto w-full max-w-7xl rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-purple-600/5 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70 dark:shadow-purple-400/10 px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline hover:no-underline">
            <img src="/simplyvest.png" alt="SimplyVest" className="h-7 w-auto" />
            <span className="text-lg font-semibold text-text">SimplyVest</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks links={links} />
            {!isApp && (
              <LinkButton to="/app" variant="brand" size="sm" className="rounded-xl px-4">
                Beta App
              </LinkButton>
            )}
            <div className="flex items-center gap-2">
              {isApp && <AuthButton />}
              <ThemeToggle />
            </div>
          </div>

          <HamburgerButton open={mobileOpen} onClick={() => setMobileOpen((o) => !o)} />
        </div>

        {mobileOpen && (
          <MobileMenu links={links} isApp={isApp} onClose={() => setMobileOpen(false)} />
        )}
      </div>
    </nav>
  );
}
