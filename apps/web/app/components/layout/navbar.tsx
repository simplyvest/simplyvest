import { Link, useRouterState } from "@tanstack/react-router";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/docs", label: "Docs" },
  { to: "/faq", label: "FAQ" },
  { to: "/waitlist", label: "Waitlist" },
  { to: "/app", label: "App" },
];

export function Navbar() {
  const { location } = useRouterState();

  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-6">
      <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg shadow-purple-600/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline hover:no-underline">
            <img src="/simplyvest.png" alt="SimplyVest" className="h-8 w-auto" />
            <span className="text-lg font-semibold text-gray-900">SimplyVest</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors no-underline hover:no-underline ${
                  location.pathname === link.to
                    ? "text-purple-600"
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
