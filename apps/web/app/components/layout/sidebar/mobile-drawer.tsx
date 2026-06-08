import { LuX } from "react-icons/lu";

import { Button } from "@/components/ui/button";

import { sidebarLinks } from "./links";
import { NavItem } from "./nav-item";
import { NavSection } from "./nav-section";
import { SidebarBottom } from "./sidebar-bottom";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-bg1 border-r border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-text">Navigation</span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <LuX className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
          <NavSection>
            {sidebarLinks.map((link) => (
              <NavItem key={link.to} {...link} onClick={onClose} />
            ))}
          </NavSection>
        </nav>

        <SidebarBottom onToggleCollapse={onClose} />
      </div>
    </>
  );
}
