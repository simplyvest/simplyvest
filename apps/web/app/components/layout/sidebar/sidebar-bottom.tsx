import { Link, useRouterState } from "@tanstack/react-router";
import {
  LuUser,
  LuCircleHelp,
  LuSun,
  LuMoon,
  LuPanelLeftClose,
  LuPanelLeftOpen,
} from "react-icons/lu";

import { useTheme } from "@/lib/theme";
import { cn } from "@/utils/cn";

interface SidebarBottomProps {
  collapsed?: boolean;
  onToggleCollapse: () => void;
}

export function SidebarBottom({ collapsed, onToggleCollapse }: SidebarBottomProps) {
  const { location } = useRouterState();
  const { resolved, theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(resolved === "dark" ? "light" : "dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("system");
    }
  };

  const profileActive = location.pathname === "/app/profile";
  const helpActive = location.pathname === "/app/help";

  return (
    <div className="flex flex-col gap-1 border-t border-border pt-3">
      <Link
        to="/app/profile"
        title={collapsed ? "Profile" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline hover:no-underline",
          collapsed && "justify-center px-2",
          profileActive
            ? "bg-sol/10 text-sol dark:bg-sol/20"
            : "text-muted hover:bg-bg2 hover:text-text",
        )}
      >
        <LuUser className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">Profile</span>}
      </Link>

      <Link
        to="/app/help"
        title={collapsed ? "Help & Support" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline hover:no-underline",
          collapsed && "justify-center px-2",
          helpActive
            ? "bg-sol/10 text-sol dark:bg-sol/20"
            : "text-muted hover:bg-bg2 hover:text-text",
        )}
      >
        <LuCircleHelp className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">Help & Support</span>}
      </Link>

      <div className="my-1 border-t border-border" />

      <button
        type="button"
        onClick={toggleTheme}
        title={collapsed ? (resolved === "dark" ? "Light mode" : "Dark mode") : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg2 hover:text-text",
          collapsed && "justify-center px-2",
        )}
      >
        {resolved === "dark" ? (
          <LuSun className="h-4 w-4 shrink-0" />
        ) : (
          <LuMoon className="h-4 w-4 shrink-0" />
        )}
        {!collapsed && (
          <span className="truncate">{resolved === "dark" ? "Light mode" : "Dark mode"}</span>
        )}
      </button>

      <button
        type="button"
        onClick={onToggleCollapse}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg2 hover:text-text",
          collapsed && "justify-center px-2",
        )}
      >
        {collapsed ? (
          <LuPanelLeftOpen className="h-4 w-4 shrink-0" />
        ) : (
          <LuPanelLeftClose className="h-4 w-4 shrink-0" />
        )}
        {!collapsed && <span className="truncate">Collapse</span>}
      </button>
    </div>
  );
}
