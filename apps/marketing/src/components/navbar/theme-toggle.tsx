import { Button } from "@simplyvest/ui/button";
import { useTheme } from "@simplyvest/ui/theme";
import { LuMoon, LuSun } from "react-icons/lu";

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
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
    >
      {resolved === "dark" ? <LuSun className="h-4 w-4" /> : <LuMoon className="h-4 w-4" />}
    </Button>
  );
}
