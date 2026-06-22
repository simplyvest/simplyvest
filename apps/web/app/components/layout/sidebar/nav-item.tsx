import { Link, useRouterState } from "@tanstack/react-router";
import type { IconType } from "react-icons/lib";

import { cn } from "@/utils/cn";

interface NavItemProps {
  to: string;
  label: string;
  icon: IconType;
  collapsed?: boolean;
  onClick?: () => void;
}

export function NavItem({ to, label, icon: Icon, collapsed, onClick }: NavItemProps) {
  const { location } = useRouterState();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline hover:no-underline",
        collapsed && "justify-center px-2",
        isActive ? "bg-primary/10 text-primary dark:bg-primary/20" : "text-muted hover:bg-bg2 hover:text-text",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
