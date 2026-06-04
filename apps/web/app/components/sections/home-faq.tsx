import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, HelpCircle } from "lucide-react";
import * as React from "react";

import { cn } from "@/utils/cn";

const faqs = [
  {
    q: "What is SimplyVest?",
    a: "SimplyVest is a non-custodial token vesting protocol on Solana. It lets you lock SPL tokens in a program-owned vault and release them to a recipient on a schedule — either time-based (linear vesting) or milestone-gated (triggered by a third party).",
  },
  {
    q: "What's the difference between time-based and milestone vesting?",
    a: "Time-based streams unlock tokens continuously from start to end, with an optional cliff before the first release. Milestone vesting holds all tokens until a designated authority triggers the release — then the full amount becomes claimable.",
  },
  {
    q: "Is SimplyVest custodial?",
    a: "No. SimplyVest is fully non-custodial. Tokens are held in a program-derived vault PDA. Only the Solana program can authorize transfers — not even the creator can move tokens outside the vesting schedule.",
  },
  {
    q: "Can I cancel a stream?",
    a: "Yes, stream creators can cancel at any time. The recipient keeps everything that has already vested, and the unvested portion returns to the creator. Both accounts are closed to recover rent.",
  },
  {
    q: "What happens when a stream completes?",
    a: "When a stream completes, the recipient withdraws the last vested tokens and the stream and vault accounts are automatically closed. The rent-exempt SOL is returned to the creator.",
  },
  {
    q: "Does SimplyVest charge fees?",
    a: "SimplyVest charges zero protocol fees. You only pay standard Solana network transaction fees, typically less than $0.01 per transaction.",
  },
  {
    q: "How do I get started?",
    a: "SimplyVest is currently in development. Join the waitlist to be notified when the beta launches, or read the documentation to learn how the protocol works under the hood.",
  },
];

export function HomeFAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-20">
      {/* Decorative blurred circles */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-sol/5 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-72 w-72 rounded-full bg-sol2/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-sol3/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Section header — centered */}
        <div className="border-t border-border pt-14 text-center">
          <div className="font-mono text-[0.68rem] uppercase tracking-wide text-dim">05</div>
          <h2 className="mt-2">Frequently Asked Questions</h2>
        </div>

        {/* FAQ accordion */}
        <div className="mt-10">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;

            return (
              <div
                key={faq.q}
                className="cursor-pointer border-b border-border"
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                {/* Question row */}
                <div className="flex items-center justify-between py-5">
                  <span className="pr-4 text-[0.95rem] font-medium text-text">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-dim transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </div>

                {/* Answer */}
                {isOpen && (
                  <div className="pb-5 pr-8">
                    <p className="text-[0.9rem] leading-relaxed text-muted">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-muted">
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm">Still have questions?</span>
          </div>
          <Link
            to="/faq"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sol no-underline transition-colors hover:text-[#6d28d9] hover:no-underline focus-visible:ring-2 focus-visible:ring-sol focus-visible:outline-none"
          >
            View full FAQ
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
