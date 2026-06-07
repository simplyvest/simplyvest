import { Link } from "@tanstack/react-router";
import * as React from "react";

import { LinkButton } from "@/components/ui/link-button";

import { HamburgerButton } from "./navbar/hamburger-button";
import { MobileMenu } from "./navbar/mobile-menu";
import { NavLinks } from "./navbar/nav-links";
import { ThemeToggle } from "./navbar/theme-toggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/docs", label: "Docs" },
  { to: "/faq", label: "FAQ" },
  { to: "/waitlist", label: "Waitlist" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

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
            <LinkButton to="/app" variant="brand" size="sm" className="rounded-xl px-4">
              Beta App
            </LinkButton>
            <ThemeToggle />
          </div>

          <HamburgerButton open={mobileOpen} onClick={() => setMobileOpen((o) => !o)} />
        </div>

        {mobileOpen && (
          <MobileMenu links={links} onClose={() => setMobileOpen(false)} />
        )}
      </div>
    </nav>
  );
}
