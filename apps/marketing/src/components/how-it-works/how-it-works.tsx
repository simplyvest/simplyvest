import { SectionDecorations, BlobBlob } from "@simplyvest/ui/section-decorations";
import { LuBuilding2, LuDownload, LuUserPlus } from "react-icons/lu";

import { Reveal } from "../reveal";
import { SECTION_PADDING, SectionHeader } from "../section-header";
import { StepCard } from "./step-card";

const steps = [
  {
    number: 1,
    title: "Sign Up",
    icon: LuUserPlus,
    label: "email · google",
    description:
      'Log in with email or Google. An embedded Solana wallet is created automatically — no extension, no seed phrase, no "what\'s gas?"',
    details: [
      "Email or Google via Privy",
      "Embedded wallet created for you",
      "Works for founders and recipients",
      "No crypto experience required",
    ],
  },
  {
    number: 2,
    title: "Set Up Your Org",
    icon: LuBuilding2,
    label: "create_org()",
    description:
      "Create your organization and issue or link an SPL token as your equity token. One company, one token, one source of truth for grants.",
    details: [
      "Create your company profile",
      "Mint or link an equity token",
      "Invite team members",
      "Manage grants from one dashboard",
    ],
  },
  {
    number: 3,
    title: "Vest & Claim",
    icon: LuDownload,
    label: "withdraw_vested()",
    description:
      "Assign vesting schedules with cliffs and milestones. Team members claim equity as it unlocks — the program enforces every rule on-chain.",
    details: [
      "Linear, cliff, and milestone schedules",
      "Recipients claim as tokens unlock",
      "Real-time vesting progress",
      "Non-custodial PDA vault custody",
    ],
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={`relative overflow-hidden ${SECTION_PADDING} bg-gradient-to-b from-white via-purple-50/20 to-white dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950`}
    >
      <SectionDecorations>
        <BlobBlob className="absolute -left-32 top-1/4 h-96 w-96 bg-purple-200/30 dark:bg-purple-800/30" />
        <BlobBlob className="absolute -right-24 top-2/3 h-80 w-80 bg-purple-300/20" />
        <BlobBlob className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 bg-purple-100/40 dark:bg-purple-900/40" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, #7c3aed 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </SectionDecorations>

      <div className="relative mx-auto max-w-4xl px-6">
        <Reveal>
          <SectionHeader
            number="02"
            title="How It Works"
            description="From sign-up to first vesting grant in minutes — web2 simplicity, on-chain settlement."
            align="center"
            className="mb-16"
          />
        </Reveal>

        <div className="flex flex-col gap-16">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 100}>
              <StepCard step={step} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={320}>
          <div className="mt-20 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-6 py-3 text-sm font-medium text-badge-purple-text shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5 dark:bg-slate-900/80">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              Carta-simple. Streamflow-secure.
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
