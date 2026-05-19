import * as React from "react";
import { cn } from "@/utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  React.useEffect(() => {
    const stored = localStorage.getItem("theme") as "dark" | "light" | null;
    const t = stored || "dark";
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "rounded-md border border-border2 bg-bg2 px-2.5 py-1 font-mono text-[0.68rem] text-muted transition-all hover:border-sol hover:text-text focus-visible:ring-2 focus-visible:ring-sol focus-visible:outline-none",
        className,
      )}
      aria-label="Toggle theme"
    >
      <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
      {" "}
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
