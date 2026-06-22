import { Link } from "@tanstack/react-router";
import { LuBuilding, LuWallet } from "react-icons/lu";

const modes = [
  {
    to: "/app/tools/create-token/platform",
    icon: LuBuilding,
    title: "Create on Platform",
    description:
      "Free — SimplyVest covers gas and creates the token for you. Just connect your wallet.",
    label: "Create on Platform →",
    bg: "bg-primary/5 border-primary/20 hover:border-primary/40",
  },
  {
    to: "/app/tools/create-token/wallet",
    icon: LuWallet,
    title: "Create with Wallet",
    description:
      "You sign and pay ~0.011 SOL in gas. Full control — the token is yours from the start.",
    label: "Create with Wallet →",
    bg: "bg-info/5 border-info/20 hover:border-info/40",
  },
] as const;

export function TokenCreateSelector() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {modes.map((m) => (
        <Link
          key={m.to}
          to={m.to}
          className={`flex flex-col rounded-xl border p-6 transition-colors no-underline hover:no-underline ${m.bg}`}
        >
          <m.icon className="h-8 w-8 text-text" />
          <h3 className="mt-4 text-lg font-semibold text-text">{m.title}</h3>
          <p className="mt-2 flex-1 text-sm text-muted">{m.description}</p>
          <span className="mt-4 text-sm font-medium text-primary">{m.label}</span>
        </Link>
      ))}
    </div>
  );
}
