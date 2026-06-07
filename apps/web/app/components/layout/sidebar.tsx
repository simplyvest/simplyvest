import { cn } from "@/utils/cn";

import { NavItem } from "./sidebar/nav-item";
import { NavSection } from "./sidebar/nav-section";
import { SidebarBottom } from "./sidebar/sidebar-bottom";
import { sidebarLinks } from "./sidebar/links";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-bg1 transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3 pt-4">
        <NavSection collapsed={collapsed}>
          {sidebarLinks.slice(0, 2).map((link) => (
            <NavItem key={link.to} {...link} collapsed={collapsed} />
          ))}
        </NavSection>

        <div className="border-t border-border" />

        <NavSection collapsed={collapsed}>
          {sidebarLinks.slice(2).map((link) => (
            <NavItem key={link.to} {...link} collapsed={collapsed} />
          ))}
        </NavSection>
      </nav>

      <div className="p-3">
        <SidebarBottom collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </div>
    </aside>
  );
}
