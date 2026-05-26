import { Link } from "@tanstack/react-router";
import * as React from "react";

import { WalletButton } from "@/components/solana/wallet-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/docs", label: "Docs" },
  { to: "/faq", label: "FAQ" },
  { to: "/waitlist", label: "Waitlist" },
  { to: "/app/create-stream", label: "App" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 no-underline hover:no-underline">
          <div className="flex items-center gap-2.5 rounded-md bg-sol p-1.5 dark:bg-transparent">
            <img src="/simplyvest.png" alt="SimplyVest" className="h-7 w-auto" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-text">SimplyVest</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded px-3 py-1.5 font-mono text-[0.67rem] tracking-wide text-muted transition-colors hover:bg-bg2 hover:text-text hover:no-underline focus-visible:ring-2 focus-visible:ring-sol focus-visible:outline-none [&.active]:text-text"
              activeProps={{ className: "text-text", "aria-current": "page" }}
            >
              {link.label}
            </Link>
          ))}
          <WalletButton />
          <ThemeToggle className="ml-2" />
        </nav>
      </div>
    </header>
  );
}
