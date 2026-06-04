import { createRoute } from "@tanstack/react-router";

import { FaqCta } from "@/components/marketing/faq/faq-cta";
import { FaqHero } from "@/components/marketing/faq/faq-hero";
import { FaqItem } from "@/components/marketing/faq/faq-item";

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
      <FaqHero />
      <section className="bg-white dark:bg-slate-900 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="flex flex-col gap-10">
            {faqData.map((item, index) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} index={index} />
            ))}
          </div>
        </div>
      </section>
      <FaqCta />
    </div>
  );
}
