import { Link, useRouterState } from "@tanstack/react-router";
import * as React from "react";
import { LuMoon, LuSun } from "react-icons/lu";

import { WalletButton } from "@/components/solana/wallet-button";
import { useTheme } from "@/lib/theme";
import { cn } from "@/utils/cn";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/docs", label: "Docs" },
  { to: "/faq", label: "FAQ" },
  { to: "/app", label: "App" },
  { to: "/waitlist", label: "Waitlist" },
];

const appLinks = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/create", label: "Create Stream" },
];

export function Navbar() {
  const { location } = useRouterState();
  const { theme, setTheme, resolved } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isApp = location.pathname.startsWith("/app");
  const links = isApp ? appLinks : publicLinks;

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <nav className="sticky top-4 z-50 mx-auto w-full max-w-7xl px-6">
      <div className="rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-purple-600/5 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70 dark:shadow-purple-400/10 px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline hover:no-underline">
            <img src="/simplyvest.png" alt="SimplyVest" className="h-7 w-auto" />
            <span className="text-lg font-semibold text-text">SimplyVest</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "text-sm font-medium transition-colors no-underline hover:no-underline",
                    isActive
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-purple-900 dark:hover:text-slate-200"
                aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
              >
                {resolved === "dark" ? (
                  <LuSun className="h-4 w-4" />
                ) : (
                  <LuMoon className="h-4 w-4" />
                )}
              </button>
              {isApp && <WalletButton />}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden rounded-lg p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-purple-900"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-3 border-t border-gray-200 dark:border-slate-700 pt-4 pb-2">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors no-underline hover:no-underline",
                    isActive
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-purple-900 dark:hover:text-slate-200"
                aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
              >
                {resolved === "dark" ? (
                  <LuSun className="h-4 w-4" />
                ) : (
                  <LuMoon className="h-4 w-4" />
                )}
              </button>
              {isApp && <WalletButton />}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
