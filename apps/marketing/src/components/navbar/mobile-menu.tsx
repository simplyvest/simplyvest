import { LinkButton } from "../link-button";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

interface NavLinkItem {
  to: string;
  label: string;
}

export function MobileMenu({
  links,
  docsUrl,
  dappUrl,
  onClose,
}: {
  links: NavLinkItem[];
  docsUrl: string;
  dappUrl: string;
  onClose: () => void;
}) {
  return (
    <div className="md:hidden mt-4 flex flex-col gap-3 border-t border-gray-200 dark:border-slate-700 pt-4 pb-2">
      <NavLinks links={links} onClick={onClose} />
      <a
        href={docsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-gray-700 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition-colors no-underline hover:no-underline px-3"
        onClick={onClose}
      >
        Docs
      </a>
      <LinkButton
        href={dappUrl}
        variant="brand"
        size="sm"
        className="w-full rounded-xl"
        target="_blank"
        rel="noopener noreferrer"
      >
        Beta App
      </LinkButton>
      <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
        <ThemeToggle />
      </div>
    </div>
  );
}
