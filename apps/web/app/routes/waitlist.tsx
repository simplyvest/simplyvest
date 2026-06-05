import { createRoute } from "@tanstack/react-router";

import { WaitlistDecorations } from "@/components/marketing/waitlist/waitlist-decorations";
import { WaitlistForm } from "@/components/marketing/waitlist/waitlist-form";
import { WaitlistHero } from "@/components/marketing/waitlist/waitlist-hero";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/waitlist",
  component: WaitlistPage,
});

function WaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950">
      <section className="relative overflow-hidden px-6 py-32">
        <WaitlistDecorations />

        <div className="relative mx-auto max-w-2xl">
          <WaitlistHero />

          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-400 to-purple-600 opacity-20 blur-lg dark:from-purple-600 dark:to-purple-800" />
            <div className="relative rounded-3xl border border-gray-100 bg-white p-10 shadow-lg md:p-12 dark:border-slate-700 dark:bg-slate-900">
              <WaitlistForm />
            </div>
          </div>

          <p className="mt-8 text-center text-sm leading-relaxed text-gray-400 dark:text-slate-500">
            We respect your privacy. Your information will only be used to contact you about
            SimplyVest. We will never share your data with third parties.
          </p>
        </div>
      </section>
    </div>
  );
}
