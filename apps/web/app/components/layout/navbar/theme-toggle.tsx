import { LuMoon, LuSun } from "react-icons/lu";

import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { resolved, theme, setTheme } = useTheme();

  const toggle = () => {
    if (theme === "system") {
      setTheme(resolved === "dark" ? "light" : "dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("system");
    }
  };

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-purple-900 dark:hover:text-slate-200"
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
    >
      {resolved === "dark" ? <LuSun className="h-4 w-4" /> : <LuMoon className="h-4 w-4" />}
    </button>
  );
}
