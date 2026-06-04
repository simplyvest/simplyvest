import { Link, useRouterState } from "@tanstack/react-router";
import {
  LuArrowRight,
  LuBookOpen,
  LuUsers,
  LuCalendar,
  LuTrendingUp,
  LuLock,
} from "react-icons/lu";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/docs", label: "Docs" },
  { to: "/faq", label: "FAQ" },
  { to: "/waitlist", label: "Waitlist" },
  { to: "/app", label: "App" },
];

const barValues = [30, 45, 60, 75, 85, 95];

export function Hero() {
  const { location } = useRouterState();

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-purple-50/20 to-white">
      {/* ---- Decorative background ---- */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* Blurred blobs */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-purple-300/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-400/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-200/10 blur-3xl" />

        {/* Dot grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.035]">
          <pattern id="hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>

        {/* Orbital rings */}
        <div className="absolute left-1/2 top-[40%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-200/30" />
        <div className="absolute left-1/2 top-[40%] h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-100/20" />
      </div>

      {/* ---- Inline navbar ---- */}
      <nav className="relative z-50 mx-auto max-w-7xl px-6 pt-6">
        <div className="rounded-2xl border border-white/60 bg-white/70 px-6 py-4 shadow-lg shadow-purple-600/5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 no-underline hover:no-underline">
              <img src="/simplyvest.png" alt="SimplyVest" className="h-8 w-auto" />
              <span className="text-lg font-semibold text-gray-900">SimplyVest</span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors no-underline hover:no-underline ${
                    location.pathname === link.to
                      ? "text-purple-600"
                      : "text-gray-600 hover:text-purple-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ---- Main content ---- */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 lg:grid lg:grid-cols-2 lg:gap-12 lg:pt-24">
        {/* Left column — copy & CTAs */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/80 px-4 py-1.5 font-mono text-[0.72rem] uppercase tracking-wide text-purple-700">
            <span className="text-purple-400">{"//"}</span>
            Solana Vesting Protocol
          </div>

          {/* Heading */}
          <h1 className="mt-8 font-display text-6xl font-bold tracking-tight text-gray-900 sm:text-7xl lg:text-8xl">
            SIMPLY
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
              VEST
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-gray-500">
            Non-custodial, programmable token vesting with time-based streams and milestone-gated
            releases on Solana.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/app/dashboard"
              search={{ tab: "created" }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:brightness-110 no-underline hover:no-underline focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
            >
              Try Beta App
              <LuArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/waitlist"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-purple-300 hover:shadow-md no-underline hover:no-underline focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
            >
              Join Waitlist
              <LuUsers className="h-4 w-4 text-purple-500" />
            </Link>

            <Link
              to="/docs"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:shadow-md no-underline hover:no-underline focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none"
            >
              Read Docs
              <LuBookOpen className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Right column — floating dashboard cards (lg+) */}
        <div className="relative mt-16 hidden lg:mt-0 lg:flex lg:flex-col lg:items-center lg:justify-center">
          {/* Connecting SVG lines */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 400 520"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="hero-line" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <path
              d="M200 148 L200 192"
              stroke="url(#hero-line)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <path
              d="M200 348 L200 392"
              stroke="url(#hero-line)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
          </svg>

          <div className="flex flex-col items-center gap-12">
            {/* Card 1 — Vesting Schedule */}
            <div className="group w-80 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg shadow-gray-900/5 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                  <LuCalendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Vesting Schedule</h3>
                  <p className="text-xs text-gray-500">Team Token Grant</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>8 / 12 months</span>
                  <span className="font-medium text-purple-600">67 %</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-[67%] rounded-full bg-gradient-to-r from-purple-500 to-purple-400" />
                </div>
                <p className="mt-2 text-xs text-gray-400">6,700 / 10,000 tokens</p>
              </div>
            </div>

            {/* Card 2 — Token Stream */}
            <div className="group w-80 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg shadow-gray-900/5 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <LuTrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Token Stream</h3>
                  <p className="text-xs text-gray-500">Active Distribution</p>
                </div>
              </div>

              {/* Mini bar chart */}
              <div className="mt-4 flex h-12 items-end gap-1.5">
                {barValues.map((val) => (
                  <div
                    key={val}
                    className="flex-1 rounded-t bg-gradient-to-t from-purple-400 to-purple-300"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>

              <p className="mt-3 text-xs text-gray-400">
                <span className="font-medium text-green-600">+41.6 tokens</span> streamed
              </p>
            </div>

            {/* Card 3 — Security Badge */}
            <div className="group w-80 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 p-5 text-white shadow-lg shadow-purple-500/25 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <LuLock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Security Badge</h3>
                  <p className="text-xs text-purple-200">Vault Protection</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-lg font-bold">PDA Vault</span>
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>
                <span className="text-xs text-purple-200">Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
