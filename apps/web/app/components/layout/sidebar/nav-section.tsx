import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

interface NavSectionProps {
  children: ReactNode;
  collapsed?: boolean;
}

export function NavSection({ children, collapsed }: NavSectionProps) {
  return (
    <div className={cn("flex flex-col gap-1", collapsed && "items-center")}>
      {children}
    </div>
  );
}
