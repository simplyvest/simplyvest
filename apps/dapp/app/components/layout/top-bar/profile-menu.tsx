import { useLogout } from "@privy-io/react-auth";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { LuLogOut } from "react-icons/lu";

import { useAuth } from "@/lib/solana/use-auth";

export function ProfileMenu() {
  const { user, publicKey } = useAuth();
  const { logout } = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName =
    user?.email ??
    user?.google ??
    (publicKey
      ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
      : "User");
  const initial = (user?.email ?? user?.google ?? "U").charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-border bg-bg1 p-1 shadow-lg">
          <div className="px-3 py-2 text-xs text-muted truncate border-b border-border mb-1">
            {displayName}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void logout().then(() => void navigate({ to: "/", search: { tab: "created" } }));
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-bg2 hover:text-text"
          >
            <LuLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
