import { cn } from "@simplyvest/ui/cn";

interface NavLinkItem {
  to: string;
  label: string;
}

export function NavLinks({ links, onClick }: { links: NavLinkItem[]; onClick?: () => void }) {
  return (
    <>
      {links.map((link) => (
        <a
          key={link.to}
          href={link.to}
          onClick={onClick}
          className={cn(
            "text-sm font-medium transition-colors no-underline hover:no-underline",
            "text-gray-700 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400",
          )}
        >
          {link.label}
        </a>
      ))}
    </>
  );
}
