import * as React from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { GapCard } from "@/components/ui/gap-card";

const useCases = [
  {
    number: "01",
    title: "Team Vesting",
    description:
      "Grant tokens to team members with custom cliff and vesting schedules. Align long-term incentives with time-locked distributions that auto-release on schedule.",
  },
  {
    number: "02",
    title: "Milestone Payments",
    description:
      "Pay freelancers and contractors upon verified completion. A designated milestone authority triggers the release — no more chasing invoices or holding deposits.",
  },
  {
    number: "03",
    title: "Self-Vesting",
    description:
      "Lock your own tokens to prevent impulsive sales. Create a stream to yourself with a vesting schedule that forces discipline on your future self.",
  },
];

export function UseCases() {
  return (
    <section className="mx-auto max-w-4xl px-6">
      <SectionHeader
        num="03"
        title="Use Cases"
        sub="From team compensation to milestone-based payments — SimplyVest handles the distribution so you can focus on building."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {useCases.map((uc) => (
          <GapCard key={uc.number} number={uc.number} title={uc.title}>
            {uc.description}
          </GapCard>
        ))}
      </div>
    </section>
  );
}
