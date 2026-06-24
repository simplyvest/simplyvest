import { cn } from "@simplyvest/ui/cn";
import type { ReactNode } from "react";

interface NavSectionProps {
  children: ReactNode;
  collapsed?: boolean;
}

export function NavSection({ children, collapsed }: NavSectionProps) {
  return <div className={cn("flex flex-col gap-1", collapsed && "items-center")}>{children}</div>;
}
