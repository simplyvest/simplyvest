import * as React from "react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 font-mono text-[0.68rem] text-muted">
        <span>SimplyVest &mdash; Solana Vesting Protocol</span>
        <div className="flex gap-4">
          <a
            href="https://github.com/simplyvest/simplyvest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-text"
            aria-label="SimplyVest on GitHub (opens in new tab)"
          >
            GitHub
          </a>
          <a
            href="https://x.com/simplyvestsol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-text"
            aria-label="SimplyVest on X (opens in new tab)"
          >
            X
          </a>
        </div>
      </div>
    </footer>
  );
}
