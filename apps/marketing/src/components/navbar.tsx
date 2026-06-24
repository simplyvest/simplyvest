import * as React from "react";

import { LinkButton } from "./link-button";
import { HamburgerButton } from "./navbar/hamburger-button";
import { MobileMenu } from "./navbar/mobile-menu";
import { NavLinks } from "./navbar/nav-links";
import { ThemeToggle } from "./navbar/theme-toggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/faq", label: "FAQ" },
  { to: "/waitlist", label: "Waitlist" },
];

const DOCS_URL = import.meta.env.PUBLIC_DOCS_URL ?? "http://localhost:4324";
const DAPP_URL = import.meta.env.PUBLIC_DAPP_URL ?? "http://localhost:5173";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 px-6 pt-4">
      <div className="mx-auto w-full max-w-7xl rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-purple-600/5 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70 dark:shadow-purple-400/10 px-6 py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 no-underline hover:no-underline">
            <div className="flex items-center rounded-lg bg-primary p-1">
              <img src="/simplyvest.png" alt="SimplyVest" className="h-5 w-auto" />
            </div>
            <span className="text-lg font-semibold text-text">SimplyVest</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks links={links} />
            <a
              href={DOCS_URL}
              className="text-sm font-medium text-gray-700 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition-colors no-underline hover:no-underline"
            >
              Docs
            </a>
            <LinkButton href={DAPP_URL} variant="brand" size="sm" className="rounded-xl px-4">
              Beta App
            </LinkButton>
            <ThemeToggle />
          </div>

          <HamburgerButton open={mobileOpen} onClick={() => setMobileOpen((o) => !o)} />
        </div>

        {mobileOpen && (
          <MobileMenu links={links} docsUrl={DOCS_URL} onClose={() => setMobileOpen(false)} />
        )}
      </div>
    </nav>
  );
}
