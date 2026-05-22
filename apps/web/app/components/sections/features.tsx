import * as React from "react";

import { SectionHeader } from "@/components/ui/section-header";
import { VestingCard } from "@/components/ui/vesting-card";

const features = [
  {
    color: "#9945ff",
    label: "Time-Based",
    title: "Linear Vesting",
    description:
      "Lock tokens with a linear vesting curve. Optionally add a cliff for single-point unlocks.",
    examples: [
      "Team token grants with 1-year cliff and 3-year vesting",
      "Investor lockups with linear release schedules",
      "Salary streaming with second-by-second accrual",
    ],
    diagram: (
      <div className="mb-3 flex h-10 items-end gap-0.5">
        {[20, 35, 45, 55, 65, 75, 85, 95, 100].map((h, i) => (
          <div
            key={h}
            className="flex-1 rounded-t-sm opacity-30 [&.active]:opacity-100"
            style={{
              height: `${h}%`,
              background: "#9945ff",
              opacity: i < 6 ? 0.6 : i < 8 ? 0.3 : 1,
            }}
          />
        ))}
        <div
          className="flex-1 rounded-t-sm opacity-100"
          style={{ height: "100%", background: "#9945ff" }}
        />
      </div>
    ),
  },
  {
    color: "#14f195",
    label: "Milestone",
    title: "Milestone Payments",
    description:
      "Gated releases tied to real-world milestones. A designated authority triggers the release.",
    examples: [
      "Freelance payments upon project completion",
      "Grant disbursements after KPI verification",
      "Escrow for service agreements",
    ],
  },
  {
    color: "#00c2ff",
    label: "Non-Custodial",
    title: "PDA Vaults",
    description:
      "Tokens are held in program-derived vault accounts. No one can move them except the program — not even the creator.",
    examples: [
      "Funds returned to creator if stream is cancelled",
      "Recipient can only claim vested tokens",
      "Program is authority over all vaults",
    ],
  },
  {
    color: "#f7931a",
    label: "Control",
    title: "Cancel Anytime",
    description:
      "Creators can cancel a stream at any time. Recipient keeps what's vested; unvested tokens return to the creator.",
    examples: [
      "Employee leaves mid-vesting schedule",
      "Contract terminated before milestone is reached",
      "Fundraising round cancelled",
    ],
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-4xl px-6">
      <SectionHeader
        num="01"
        title="Features"
        sub="SimplyVest supports two stream types for flexible token distribution."
      />
      <div className="mt-8 grid gap-1 overflow-hidden rounded-xl border border-border sm:grid-cols-2">
        {features.map((f) => (
          <VestingCard
            key={f.label}
            color={f.color}
            label={f.label}
            title={f.title}
            description={f.description}
            examples={f.examples}
          >
            {"diagram" in f && f.diagram}
          </VestingCard>
        ))}
      </div>
    </section>
  );
}
