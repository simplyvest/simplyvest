import { LuMail } from "react-icons/lu";

import { LinkButton } from "../link-button";

export function FaqCta() {
  return (
    <section className="pb-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-3xl border border-purple-100 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 dark:from-purple-950 to-violet-50 dark:to-slate-950 px-8 py-16 text-center sm:px-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">
            Still have questions?
          </h2>
          <p className="mt-3 text-gray-600 dark:text-slate-300">
            We&apos;re here to help. Reach out through our community channels or check the
            documentation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={import.meta.env.VITE_DOCS_URL ?? "https://docs.simplyvest.xyz"}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30 transition-shadow no-underline"
            >
              View Documentation
            </a>
            <LinkButton
              href="/waitlist"
              variant="outline"
              className="rounded-xl px-6 py-3 border-gray-200 dark:border-slate-600"
            >
              <LuMail className="h-4 w-4" aria-hidden="true" focusable="false" />
              Join Waitlist
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
