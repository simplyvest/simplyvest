import { Link, useRouterState } from "@tanstack/react-router";
import { LuMoon, LuSun } from "react-icons/lu";

import { useTheme } from "@/lib/theme";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/docs", label: "Docs" },
  { to: "/faq", label: "FAQ" },
  { to: "/waitlist", label: "Waitlist" },
  { to: "/app", label: "App" },
];

export function Navbar() {
  const { location } = useRouterState();

  const { theme, setTheme, resolved } = useTheme();
  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark"); // system → dark
  };
  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-6">
      <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg shadow-purple-600/5 dark:bg-slate-900/70 dark:border-slate-700/60 dark:shadow-purple-400/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline hover:no-underline">
            <img src="/simplyvest.png" alt="SimplyVest" className="h-8 w-auto" />
            <span className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              SimplyVest
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors no-underline hover:no-underline ${
                  location.pathname === link.to
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-purple-900 dark:hover:text-slate-200"
              aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
            >
              {resolved === "dark" ? <LuSun className="h-4 w-4" /> : <LuMoon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
