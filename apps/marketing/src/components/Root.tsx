import { ThemeProvider } from "@simplyvest/ui/theme";
import type { ReactNode } from "react";

export function Root({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
