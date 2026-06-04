import {
  LuClock,
  LuFlag,
  LuLock,
  LuUserCheck,
  LuDollarSign,
  LuCoins,
  LuDatabase,
  LuSettings,
} from "react-icons/lu";

/* ─── Data arrays ──────────────────────────────────────────────────────── */

const streamTypes = [
  {
    color: "purple" as const,
    icon: LuClock,
    label: "TIME-BASED",
    title: "STREAMACCOUNT",
    description:
      "Linear vesting from start to end, with optional cliff. Tokens vest continuously based on elapsed time.",
    points: [
      "Continuous linear vesting",
      "Optional cliff period",
      "Claim anytime after cliff",
      "Cancel and refund unvested",
    ],
  },
  {
    color: "green" as const,
    icon: LuFlag,
    label: "MILESTONE",
    title: "MILESTONESTREAM",
    description:
      "All-or-nothing release gated by a milestone authority. When triggered, the full amount is claimable.",
    points: [
      "Milestone-gated releases",
      "Creator must approve unlock",
      "Multiple milestone support",
      "Flexible criteria definition",
    ],
  },
] as const;

const accountTypes = [
  {
    icon: LuDatabase,
    color: "purple" as const,
    label: "STREAM ACCOUNT",
    monoLabel: "StreamAccount",
    description:
      "Stores stream metadata: creator, recipient, mint, vault, amount, amounts withdrawn, timestamps. Created at stream creation and closed on completion or cancellation.",
  },
  {
    icon: LuLock,
    color: "green" as const,
    label: "VAULT ACCOUNT",
    monoLabel: "VaultAccount",
    description:
      "A custom PDA token account holding the locked tokens. The stream PDA is the authority. Closed on completion or cancellation to return rent SOL to the creator.",
  },
  {
    icon: LuSettings,
    color: "blue" as const,
    label: "CREATOR CONFIG",
    monoLabel: "CreatorConfig",
    description:
      "One per creator. Tracks a sequential nonce enabling multiple streams between the same creator, recipient, and mint without address collisions.",
  },
] as const;

const securityFeatures = [
  {
    icon: LuLock,
    color: "purple" as const,
    title: "PDA Vaults",
    description:
      "All tokens secured in program-derived addresses with mathematical guarantees. Only the program can authorize transfers via invoke_signed.",
  },
  {
    icon: LuUserCheck,
    color: "green" as const,
    title: "Recipient Commitment",
    description:
      "Recipient address locked at creation and encoded in the PDA seeds. The address itself proves who the stream is for.",
  },
  {
    icon: LuDollarSign,
    color: "blue" as const,
    title: "Rent Recovery",
    description:
      "Automatic SOL rent refund when closing streams. Vault and stream accounts closed, returning rent-exempt SOL to the creator.",
  },
  {
    icon: LuCoins,
    color: "orange" as const,
    title: "Token-2022",
    description:
      "Full support for Token-2022 program. Transfer-hook mints are rejected to prevent silent CPI failures during withdraw or cancel.",
  },
] as const;

/* ─── Color maps ────────────────────────────────────────────────────────── */

const accentBar: Record<string, string> = {
  purple: "bg-gradient-to-r from-purple-500 to-purple-600",
  green: "bg-gradient-to-r from-emerald-500 to-emerald-600",
  blue: "bg-gradient-to-r from-blue-500 to-blue-600",
  orange: "bg-gradient-to-r from-orange-400 to-orange-500",
};

const iconBg: Record<string, string> = {
  purple: "bg-gradient-to-br from-purple-600 to-purple-500",
  green: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  blue: "bg-gradient-to-br from-blue-500 to-blue-600",
  orange: "bg-gradient-to-br from-orange-400 to-orange-500",
};

const iconText: Record<string, string> = {
  purple: "text-white",
  green: "text-white",
  blue: "text-white",
  orange: "text-white",
};

const bulletColor: Record<string, string> = {
  purple: "bg-purple-500",
  green: "bg-emerald-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
};

const hoverBg: Record<string, string> = {
  purple: "hover:bg-purple-50/50",
  green: "hover:bg-emerald-50/50",
  blue: "hover:bg-blue-50/50",
  orange: "hover:bg-orange-50/50",
};

const leftAccentBar: Record<string, string> = {
  purple: "bg-gradient-to-b from-purple-500 to-purple-600",
  green: "bg-gradient-to-b from-emerald-500 to-emerald-600",
  blue: "bg-gradient-to-b from-blue-500 to-blue-600",
  orange: "bg-gradient-to-b from-orange-400 to-orange-500",
};

/* ─── Section Header ────────────────────────────────────────────────────── */

function SectionHeader({
  num,
  numColor = "purple",
  title,
  subtitle,
  center = false,
}: {
  num: string;
  numColor?: string;
  title: string;
  subtitle: string;
  center?: boolean;
}) {
  const numBg: Record<string, string> = {
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className={center ? "text-center" : ""}>
      {center && (
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-300" />
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold ${numBg[numColor] ?? numBg.purple}`}
          >
            {num}
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-300" />
        </div>
      )}
      {!center && (
        <div className="flex items-center gap-4">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold ${numBg[numColor] ?? numBg.purple}`}
          >
            {num}
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-4xl">
            {title}
          </h2>
        </div>
      )}
      {center && (
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-4xl">
          {title}
        </h2>
      )}
      <p
        className={`mt-3 max-w-[580px] text-[0.95rem] leading-relaxed text-gray-500 dark:text-slate-400 ${center ? "mx-auto" : ""}`}
      >
        {subtitle}
      </p>
    </div>
  );
}

export {
  streamTypes,
  accountTypes,
  securityFeatures,
  accentBar,
  iconBg,
  iconText,
  bulletColor,
  hoverBg,
  leftAccentBar,
  SectionHeader,
};
