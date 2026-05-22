import * as React from "react";

import { ConceptRow } from "@/components/ui/concept-row";
import { SectionHeader } from "@/components/ui/section-header";

const steps = [
  {
    icon: "01",
    title: "Create Stream",
    monoLabel: "sender·create_stream",
    color: "#9945ff",
    content:
      "The sender creates a vesting stream specifying the recipient, token mint, total amount, and time parameters (start, cliff, end). A unique PDA is derived from the sender, recipient, mint, and nonce.",
  },
  {
    icon: "02",
    title: "Lock Tokens",
    monoLabel: "program·vault",
    color: "#14f195",
    content:
      "Tokens are transferred from the sender into a program-owned vault PDA. Once locked, neither the sender nor recipient can move them outside the vesting schedule. The program is the sole authority.",
  },
  {
    icon: "03",
    title: "Claim Vested",
    monoLabel: "recipient·withdraw",
    color: "#00c2ff",
    content:
      "The recipient can withdraw any amount of vested tokens at any time. The program calculates the vested amount based on the current timestamp and automatically creates the recipient's token account if needed.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-4xl px-6">
      <SectionHeader
        num="02"
        title="How It Works"
        sub="Three simple steps to create and manage token vesting on Solana."
      />
      <div className="mt-8 flex flex-col gap-4">
        {steps.map((step) => (
          <ConceptRow
            key={step.monoLabel}
            icon={step.icon}
            title={step.title}
            monoLabel={step.monoLabel}
            color={step.color}
          >
            <p className="text-[0.9rem] leading-relaxed text-muted">{step.content}</p>
          </ConceptRow>
        ))}
      </div>
    </section>
  );
}
