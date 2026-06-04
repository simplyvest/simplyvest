import { Link } from "@tanstack/react-router";
import { LuMail } from "react-icons/lu";
import { SiGithub, SiX } from "react-icons/si";

const footerLinks = {
  product: [
    { name: "Features", href: "/#features" },
    { name: "Documentation", href: "/docs" },
    { name: "Waitlist", href: "/waitlist" },
  ],
  resources: [
    { name: "Docs", href: "/docs" },
    { name: "FAQ", href: "/faq" },
    { name: "Support", href: "/waitlist" },
  ],
  company: [
    { name: "About", href: "/" },
    { name: "GitHub", href: "https://github.com/simplyvest/simplyvest" },
    { name: "App", href: "/app" },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-white dark:bg-slate-950 border-t border-purple-100 dark:border-purple-900/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 no-underline hover:no-underline">
              <img src="/simplyvest.png" alt="SimplyVest" className="h-8 w-auto" />
              <span className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                SimplyVest
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Non-custodial, programmable token vesting on Solana. Time-based streams and milestone
              releases, secured by math.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-bold tracking-wider text-gray-900 dark:text-slate-100 uppercase mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 dark:text-slate-400 hover:text-purple-600 transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-gray-500 dark:text-slate-400 hover:text-purple-600 transition-colors no-underline hover:no-underline"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} SimplyVest. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/simplyvest/simplyvest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-purple-600 transition-colors dark:text-slate-400 dark:hover:text-purple-400"
                aria-label="GitHub"
              >
                <SiGithub className="w-5 h-5" aria-hidden="true" focusable="false" />
              </a>
              <a
                href="https://x.com/simplyvestsol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-purple-600 transition-colors dark:text-slate-400 dark:hover:text-purple-400"
                aria-label="Twitter"
              >
                <SiX className="w-5 h-5" aria-hidden="true" focusable="false" />
              </a>
              <a
                href="mailto:hello@simplyvest.com"
                className="text-gray-500 hover:text-purple-600 transition-colors dark:text-slate-400 dark:hover:text-purple-400"
                aria-label="Email"
              >
                <LuMail
                  className="w-5 h-5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                  focusable="false"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
