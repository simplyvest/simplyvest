import { createRoute } from "@tanstack/react-router";
import {
  LuClock,
  LuFlag,
  LuFileText,
  LuLock,
  LuUserCheck,
  LuDollarSign,
  LuCoins,
  LuShield,
  LuDatabase,
  LuSettings,
} from "react-icons/lu";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/docs",
  component: DocsPage,
});

/* ─── Data ────────────────────────────────────────────────────────────── */

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

/* ─── Color maps ──────────────────────────────────────────────────────── */

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

/* ─── Section Header ──────────────────────────────────────────────────── */

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

/* ─── Page ────────────────────────────────────────────────────────────── */

function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950 pt-28 pb-20">
        {/* Decorative blurred circles */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-purple-300/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-400/15 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-200/10 blur-3xl" />
          {/* Dot grid */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.035]">
            <defs>
              <pattern
                id="docs-dots"
                x="0"
                y="0"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#docs-dots)" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Left column — copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/80 dark:bg-purple-950/80 px-4 py-1.5 font-mono text-[0.72rem] uppercase tracking-wide text-purple-700 dark:text-purple-300">
              <span className="text-purple-400">{"//"}</span>
              Protocol V1
            </div>

            <h1 className="mt-8 font-display text-5xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-6xl lg:text-7xl">
              DOCS
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
                OVERVIEW
              </span>
            </h1>

            <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-gray-500 dark:text-slate-400">
              SimplyVest is a non-custodial, on-chain SPL-token vesting and distribution protocol
              built with Anchor on Solana. Everything you need to understand the architecture.
            </p>
          </div>

          {/* Right column — floating cards (hidden on mobile, visible lg+) */}
          <div className="relative mt-16 hidden lg:mt-0 lg:flex lg:flex-col lg:items-center lg:justify-center">
            {/* Connecting lines */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 400 460"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="docs-line" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <path
                d="M200 128 L200 168"
                stroke="url(#docs-line)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <path
                d="M200 288 L200 328"
                stroke="url(#docs-line)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
            </svg>

            <div className="flex flex-col items-center gap-8">
              {/* Card 1 — FileText */}
              <div
                className="w-72 rounded-2xl border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-900 p-5 shadow-lg shadow-gray-900/5 transition-transform duration-300 hover:scale-105"
                style={{ transform: "rotate(3deg)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900">
                    <LuFileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      Documentation
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Protocol Reference</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div className="h-full w-3/4 rounded-full bg-purple-200 dark:bg-purple-800" />
                  </div>
                  <div className="h-2 w-5/6 rounded-full bg-gray-100">
                    <div className="h-full w-1/2 rounded-full bg-purple-100 dark:bg-purple-900" />
                  </div>
                </div>
              </div>

              {/* Card 2 — Database */}
              <div
                className="w-72 rounded-2xl border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-900 p-5 shadow-lg shadow-gray-900/5 transition-transform duration-300 hover:scale-105"
                style={{ transform: "rotate(-3deg)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <LuDatabase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      Account Model
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">On-chain State</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div className="h-full w-2/3 rounded-full bg-blue-200" />
                  </div>
                  <div className="h-2 w-4/6 rounded-full bg-gray-100">
                    <div className="h-full w-3/5 rounded-full bg-blue-100" />
                  </div>
                </div>
              </div>

              {/* Card 3 — Coins (purple gradient) */}
              <div className="w-72 overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-600 to-purple-500 p-5 shadow-lg shadow-purple-500/25 transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      <LuCoins className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Token Streams</h3>
                      <p className="text-xs text-purple-200">SPL &amp; Token-2022</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="inline-flex rounded-full bg-white/20 px-3 py-0.5 font-mono text-[0.65rem] font-medium text-white">
                    SOLANA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 01  Stream Types ────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            num="01"
            title="Stream Types"
            subtitle="Two types of vesting streams for different distribution models."
          />

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {streamTypes.map((stream) => {
              const Icon = stream.icon;
              const c = stream.color;
              return (
                <div
                  key={stream.title}
                  className="group relative overflow-hidden rounded-[28px] border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-900 shadow-md transition-shadow duration-300 hover:shadow-lg"
                >
                  {/* Top accent line */}
                  <div className={`h-1 w-full ${accentBar[c]}`} />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative p-8">
                    {/* Icon + label */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg[c]}`}
                      >
                        <Icon className={`h-5 w-5 ${iconText[c]}`} />
                      </div>
                      <span
                        className={`font-mono text-[0.68rem] font-semibold uppercase tracking-widest ${c === "purple" ? "text-purple-600 dark:text-purple-400" : "text-emerald-600"}`}
                      >
                        {stream.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-4 font-mono text-xl font-bold text-gray-900 dark:text-slate-100">
                      {stream.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 text-[0.9rem] leading-relaxed text-gray-500 dark:text-slate-400">
                      {stream.description}
                    </p>

                    {/* Bullet points */}
                    <ul className="mt-6 space-y-2.5">
                      {stream.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-slate-300"
                        >
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${bulletColor[c]}`}
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 02  Account Model ───────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-gray-50/50 to-white dark:to-slate-950 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            num="02"
            numColor="blue"
            title="Account Model"
            subtitle="Three on-chain account types power the protocol."
          />

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {accountTypes.map((acct) => {
              const Icon = acct.icon;
              const c = acct.color;
              return (
                <div
                  key={acct.monoLabel}
                  className="group relative overflow-hidden rounded-[32px] border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-900 shadow-md transition-shadow duration-300 hover:shadow-lg"
                >
                  {/* Gradient blur behind icon */}
                  <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60" />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative p-8">
                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg[c]}`}
                    >
                      <Icon className={`h-6 w-6 ${iconText[c]}`} />
                    </div>

                    {/* Label */}
                    <span className="mt-5 block font-mono text-[0.68rem] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
                      {acct.label}
                    </span>

                    {/* Mono subtitle */}
                    <h3 className="mt-1 font-mono text-lg font-bold text-gray-900 dark:text-slate-100">
                      {acct.monoLabel}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 text-[0.9rem] leading-relaxed text-gray-500 dark:text-slate-400">
                      {acct.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 03  Security Model ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50/30 to-white dark:from-purple-950/30 dark:to-slate-950 py-24">
        {/* Security grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(rgba(147,51,234,1) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Large Shield watermark */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <LuShield className="h-[600px] w-[600px] text-purple-600 dark:text-purple-400 opacity-[0.05]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Section header — centered with gradient lines */}
          <SectionHeader
            num="03"
            title="Security Model"
            subtitle="Key security properties of the protocol."
            center
          />

          {/* Security panel */}
          <div className="mt-12 rounded-[32px] border border-white/60 bg-white/80 dark:border-slate-700/60 dark:bg-slate-900/80 p-8 shadow-2xl shadow-purple-600/10 backdrop-blur-sm sm:p-10">
            <div className="space-y-5">
              {securityFeatures.map((feat) => {
                const Icon = feat.icon;
                const c = feat.color;
                return (
                  <div
                    key={feat.title}
                    className={`group/item relative flex items-start gap-5 rounded-2xl p-5 transition-colors duration-200 ${hoverBg[c]}`}
                  >
                    {/* Left accent bar */}
                    <div
                      className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${leftAccentBar[c]}`}
                    />

                    {/* Icon */}
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg[c]}`}
                    >
                      <Icon className={`h-5 w-5 ${iconText[c]}`} />
                    </div>

                    {/* Text */}
                    <div className="min-w-0">
                      <h4 className="font-mono text-sm font-bold text-gray-900 dark:text-slate-100">
                        {feat.title}
                      </h4>
                      <p className="mt-1 text-[0.88rem] leading-relaxed text-gray-500 dark:text-slate-400">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
