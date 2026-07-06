import { SectionDecorations, BlobBlob } from "@simplyvest/ui/section-decorations";
import { LuGlobe, LuTarget, LuUsers } from "react-icons/lu";

import type { UseCaseItem } from "./use-case-card";

import { Reveal } from "../reveal";
import { SECTION_PADDING, SectionHeader } from "../section-header";
import { UseCaseCard } from "./use-case-card";

const useCases: UseCaseItem[] = [
  {
    icon: LuUsers,
    number: "01",
    title: "TEAM EQUITY",
    description:
      "Issue tokenized equity to employees, advisors, and early contributors. Set cliffs and vesting schedules that align incentives — without spreadsheets or manual tracking.",
    features: [
      "Employee token grants",
      "Advisor compensation",
      "Investor allocations",
      "Automated on-chain distribution",
    ],
  },
  {
    icon: LuGlobe,
    number: "02",
    title: "HYBRID TEAMS",
    description:
      "Some teammates are crypto-native, others aren't. SimplyVest works for everyone — email login for non-technical members, on-chain custody for those who want it.",
    features: [
      "No wallet setup for recipients",
      "Remote-first, global teams",
      "One tool for all skill levels",
      "Founder dashboard + claim portal",
    ],
  },
  {
    icon: LuTarget,
    number: "03",
    title: "MILESTONE GRANTS",
    description:
      "Tie equity releases to product milestones, fundraising rounds, or performance targets. A designated authority triggers unlocks when conditions are met.",
    features: [
      "Performance-based unlocks",
      "Fundraising milestone gates",
      "Custom trigger criteria",
      "Linear + cliff + milestone combined",
    ],
  },
];

export function UseCases() {
  return (
    <section
      id="use-cases"
      className={`relative overflow-hidden ${SECTION_PADDING} bg-white dark:bg-slate-900`}
    >
      <SectionDecorations>
        <BlobBlob className="pointer-events-none absolute -left-32 top-1/4 h-64 w-64 bg-purple-200/30 dark:bg-purple-800/30" />
        <BlobBlob className="pointer-events-none absolute -right-32 top-1/3 h-72 w-72 bg-violet-200/25 dark:bg-violet-800/25" />
        <BlobBlob className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 bg-purple-100/40 dark:bg-purple-900/40" />
      </SectionDecorations>

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <SectionHeader
            number="03"
            title="Who It's For"
            description="Web3 founders with hybrid teams who need real equity tooling — not another crypto-native vesting widget."
            align="center"
            className="mb-16"
          />
        </Reveal>

        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
          {useCases.map((item, index) => (
            <Reveal key={item.number} className="h-full" delay={index * 100}>
              <UseCaseCard item={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
