import { Link } from "@tanstack/react-router";
import { SiGithub } from "react-icons/si";

export function FaqCta() {
  return (
    <section className="pb-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-3xl border border-purple-100 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 dark:from-purple-950 to-violet-50 px-8 py-16 text-center sm:px-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">
            Still have questions?
          </h2>
          <p className="mt-3 text-gray-600 dark:text-slate-300">
            We&apos;re here to help. Reach out through our community channels or check the
            documentation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 dark:shadow-purple-400/25 transition-colors hover:bg-purple-700 no-underline hover:no-underline"
            >
              View Documentation
            </Link>
            <Link
              to="/waitlist"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-slate-100 shadow-sm transition-colors hover:bg-gray-50 no-underline hover:no-underline"
            >
              <SiGithub className="h-4 w-4" aria-hidden="true" focusable="false" />
              Join Community
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
