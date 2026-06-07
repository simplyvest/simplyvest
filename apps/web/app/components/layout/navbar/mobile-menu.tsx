import { LinkButton } from "@/components/ui/link-button";

import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

interface NavLinkItem {
  to: string;
  label: string;
}

export function MobileMenu({
  links,
  onClose,
}: {
  links: NavLinkItem[];
  onClose: () => void;
}) {
  return (
    <div className="md:hidden mt-4 flex flex-col gap-3 border-t border-gray-200 dark:border-slate-700 pt-4 pb-2">
      <NavLinks links={links} onClick={onClose} />
      <LinkButton
        to="/app"
        variant="brand"
        size="sm"
        className="w-full rounded-xl"
        onClick={onClose}
      >
        Beta App
      </LinkButton>
      <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
        <ThemeToggle />
      </div>
    </div>
  );
}
