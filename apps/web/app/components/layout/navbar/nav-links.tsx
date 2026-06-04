import { Link, useRouterState } from "@tanstack/react-router";

import { cn } from "@/utils/cn";

interface NavLinkItem {
  to: string;
  label: string;
}

export function NavLinks({ links, onClick }: { links: NavLinkItem[]; onClick?: () => void }) {
  const { location } = useRouterState();

  return (
    <>
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClick}
            className={cn(
              "text-sm font-medium transition-colors no-underline hover:no-underline",
              isActive
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-700 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
