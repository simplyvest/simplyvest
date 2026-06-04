import { WalletButton } from "@/components/solana/wallet-button";

import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

interface NavLinkItem {
  to: string;
  label: string;
}

export function MobileMenu({
  links,
  isApp,
  onClose,
}: {
  links: NavLinkItem[];
  isApp: boolean;
  onClose: () => void;
}) {
  return (
    <div className="md:hidden mt-4 flex flex-col gap-3 border-t border-gray-200 dark:border-slate-700 pt-4 pb-2">
      <NavLinks links={links} onClick={onClose} />
      <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
        <ThemeToggle />
        {isApp && <WalletButton />}
      </div>
    </div>
  );
}
