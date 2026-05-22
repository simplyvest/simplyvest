import * as React from "react";

import { SectionHeader } from "@/components/ui/section-header";
import { Stat } from "@/components/ui/stat";

const items = [
  {
    value: "PDA",
    label: "Vaults",
    color: "sol" as const,
    desc: "Tokens held in program-derived accounts. Only the Solana program can authorize transfers via invoke_signed.",
  },
  {
    value: "SOL",
    label: "Rent Recovery",
    color: "sol2" as const,
    desc: "Rent-exempt SOL returned to the creator when a stream completes or is cancelled. No locked rent.",
  },
  {
    value: "MIT",
    label: "Open Source",
    color: "sol3" as const,
    desc: "Fully auditable code on GitHub. No closed-source dependencies or black-box contracts.",
  },
  {
    value: "0",
    label: "Protocol Fees",
    color: "warn" as const,
    desc: "SimplyVest charges zero fees. You only pay Solana network transaction fees.",
  },
];

export function Security() {
  return (
    <section className="mx-auto max-w-4xl px-6">
      <SectionHeader
        num="04"
        title="Trust & Security"
        sub="Built on Solana with security-first design principles."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {items.map((item) => (
          <Stat
            key={item.label}
            value={item.value}
            label={item.label}
            color={item.color}
            desc={item.desc}
          />
        ))}
      </div>
    </section>
  );
}
