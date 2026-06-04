import { createRoute, Link } from "@tanstack/react-router";
import { SiGithub } from "react-icons/si";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

import { Route as RootRoute } from "./__root";

const faqData = [
  {
    q: "What is SimplyVest?",
    a: "SimplyVest is a non-custodial, on-chain SPL-token vesting and distribution protocol built with Anchor on Solana. It enables automated token unlocking based on time or milestone conditions.",
  },
  {
    q: "How do I create a vesting stream?",
    a: "Connect your Solana wallet, specify the recipient address, token amount, vesting duration, and optional cliff period. The protocol automatically creates a PDA vault and locks your tokens according to the schedule you define.",
  },
  {
    q: "What's the difference between time-based and milestone vesting?",
    a: "Time-based streams unlock tokens linearly over a specified duration. Milestone streams require creator approval for each unlock, making them ideal for performance-based or conditional vesting.",
  },
  {
    q: "Is SimplyVest custodial?",
    a: "No. SimplyVest is fully non-custodial. All tokens are secured in program-derived addresses (PDAs) with no admin keys or third-party custody. Only the recipient can claim vested tokens according to the defined schedule.",
  },
  {
    q: "Can I cancel a stream?",
    a: "Yes, stream creators can cancel active streams at any time. Unvested tokens are returned to the creator, and vested tokens remain claimable by the recipient. Rent SOL is automatically recovered.",
  },
  {
    q: "What happens when a stream completes?",
    a: "When a stream completes or is cancelled, the Solana rent is automatically refunded to the creator. No SOL remains locked in closed accounts.",
  },
  {
    q: "Does SimplyVest charge fees?",
    a: "SimplyVest charges zero protocol fees. Users only pay standard Solana network transaction fees when creating, claiming, or cancelling streams.",
  },
  {
    q: "How do I get started?",
    a: "SimplyVest is currently in development. Join our waitlist to be notified when we launch and be among the first to create and manage vesting streams on Solana.",
  },
];

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/faq",
  component: FAQPage,
});

function FAQPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/20 to-white pt-32 pb-20">
        {/* Decorative blurred circles */}
        <div className="pointer-events-none absolute top-10 left-1/4 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-violet-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <span className="inline-block rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-700">
            FAQ
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Common questions about SimplyVest, token vesting, and the protocol.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="flex flex-col gap-10">
            {faqData.map((item, index) => (
              <div key={item.q}>
                {index > 0 && (
                  <div className="mb-10 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
                )}
                <div className="flex items-start gap-4">
                  <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-purple-500" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 md:text-2xl">{item.q}</h3>
                    <p className="mt-3 text-lg leading-relaxed text-gray-600">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50 px-8 py-16 text-center sm:px-12">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Still have questions?</h2>
            <p className="mt-3 text-gray-600">
              We're here to help. Reach out through our community channels or check the
              documentation.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-colors hover:bg-purple-700 no-underline hover:no-underline"
              >
                View Documentation
              </Link>
              <Link
                to="/waitlist"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-50 no-underline hover:no-underline"
              >
                <SiGithub className="h-4 w-4" />
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
