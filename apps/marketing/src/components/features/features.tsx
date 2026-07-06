import { LuFlag, LuMail, LuShield, LuTrendingUp } from "react-icons/lu";

import { Reveal } from "../reveal";
import { SECTION_PADDING, SectionHeader } from "../section-header";
import { FeatureCard } from "./feature-card";

const features = [
  {
    icon: LuMail,
    title: "No wallet required",
    description:
      "Sign in with email or Google. Embedded wallets are created automatically so your whole team can participate.",
  },
  {
    icon: LuTrendingUp,
    title: "Flexible vesting schedules",
    description:
      "Linear unlocks, cliffs, and custom timelines — configured from a dashboard, enforced on-chain.",
  },
  {
    icon: LuFlag,
    title: "Milestone-based grants",
    description:
      "Tie equity releases to product launches, fundraising, or performance targets you define.",
  },
  {
    icon: LuShield,
    title: "On-chain custody",
    description:
      "Every grant lives in a program-derived vault. Tokens move only according to the vesting schedule.",
  },
] as const;

export function Features() {
  return (
    <section
      id="features"
      className={`${SECTION_PADDING} bg-gradient-to-b from-white dark:from-slate-950 via-purple-50/20 dark:via-purple-950/30 to-gray-50 dark:to-slate-950`}
    >
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <SectionHeader
            number="01"
            title="Platform"
            description="Tokenized equity vesting with web2 UX and on-chain settlement. Everything your team needs in one place."
            align="center"
            className="mb-12"
          />
        </Reveal>

        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2">
          {features.map((feature, index) => (
            <Reveal key={feature.title} className="h-full" delay={index * 80}>
              <FeatureCard {...feature} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
