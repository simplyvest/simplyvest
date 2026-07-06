import { Logo } from "@simplyvest/ui/logo/logo";
import { ThemeProvider } from "@simplyvest/ui/theme";
import { SiGithub, SiX } from "react-icons/si";

import { DOCS_URL as DOCS_BASE, FAQ_PATH } from "../constants";

const DOCS_URL = import.meta.env.PUBLIC_DOCS_URL ?? DOCS_BASE;
const DAPP_URL = import.meta.env.PUBLIC_DAPP_URL ?? "http://localhost:5173";

const footerLinks = {
  product: [
    { name: "Features", href: "/#features" },
    { name: "Documentation", href: DOCS_URL },
    { name: "Waitlist", href: "/waitlist" },
  ],
  resources: [
    { name: "Docs", href: DOCS_URL },
    { name: "FAQ", href: `${DOCS_URL}${FAQ_PATH}` },
    { name: "Support", href: "/waitlist" },
  ],
  company: [
    { name: "GitHub", href: "https://github.com/simplyvest/simplyvest" },
    { name: "App", href: DAPP_URL },
  ],
};

export function Footer() {
  return (
    <ThemeProvider>
      <footer className="relative bg-white dark:bg-slate-950 border-t border-purple-100 dark:border-purple-900/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="col-span-2">
              <a href="/" className="flex items-center gap-2 mb-4 no-underline hover:no-underline">
                <Logo size={24} />
                <span className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  SimplyVest
                </span>
              </a>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed max-w-xs">
                Tokenized equity vesting with web2 UX. Issue equity tokens, vest to your team, and
                settle on-chain — no wallet required.
              </p>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([category, items]) => (
              <div key={category} className="col-span-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-200 uppercase tracking-wider mb-4">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm text-gray-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors no-underline hover:no-underline"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200 dark:border-slate-800">
            <p className="text-sm text-gray-500 dark:text-slate-500">
              &copy; {new Date().getFullYear()} SimplyVest. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a
                href="https://github.com/simplyvest/simplyvest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                aria-label="GitHub"
              >
                <SiGithub className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/simplyvest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                aria-label="X (Twitter)"
              >
                <SiX className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </ThemeProvider>
  );
}
