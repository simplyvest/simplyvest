import { Button } from "@simplyvest/ui/button";
import { Logo } from "@simplyvest/ui/logo/logo";
import { Link } from "@tanstack/react-router";
import { LuMenu } from "react-icons/lu";

import { ChainBadge } from "./top-bar/chain-badge";
import { ProfileMenu } from "./top-bar/profile-menu";

interface TopBarProps {
  onMobileMenuToggle: () => void;
}

export function TopBar({ onMobileMenuToggle }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg1/80 backdrop-blur-xl px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuToggle}
          className="md:hidden"
          aria-label="Open menu"
        >
          <LuMenu className="h-5 w-5" />
        </Button>

        <Link
          to="/"
          search={{ tab: "created" }}
          className="flex items-center gap-2 no-underline hover:no-underline"
        >
          <Logo size={20} title="SimplyVest" />
          <span className="text-base font-semibold text-text">SimplyVest</span>
        </Link>

        <ChainBadge />
      </div>

      <ProfileMenu />
    </header>
  );
}
