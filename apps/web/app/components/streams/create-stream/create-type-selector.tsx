import { Link } from "@tanstack/react-router";
import { LuTimer, LuSnowflake, LuTrophy } from "react-icons/lu";

const streamTypes = [
  {
    to: "/app/create/linear",
    icon: LuTimer,
    title: "Linear",
    description: "Continuous token streaming over a set period. Tokens unlock every second.",
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20 hover:border-primary/40",
  },
  {
    to: "/app/create/cliff",
    icon: LuSnowflake,
    title: "Cliff",
    description: "Tokens are locked until a cliff date, then stream linearly until end.",
    color: "text-info",
    bg: "bg-info/5 border-info/20 hover:border-info/40",
  },
  {
    to: "/app/create/milestone",
    icon: LuTrophy,
    title: "Milestone",
    description: "Tokens are released when a milestone authority approves each milestone.",
    color: "text-success",
    bg: "bg-success/5 border-success/20 hover:border-success/40",
  },
] as const;

export function CreateTypeSelector() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {streamTypes.map((type) => (
        <Link
          key={type.to}
          to={type.to}
          className={`flex flex-col rounded-xl border p-6 transition-colors no-underline hover:no-underline ${type.bg}`}
        >
          <type.icon className={`h-8 w-8 ${type.color}`} />
          <h3 className="mt-4 text-lg font-semibold text-text">{type.title}</h3>
          <p className="mt-2 flex-1 text-sm text-muted">{type.description}</p>
          <span className={`mt-4 text-sm font-medium ${type.color}`}>Create →</span>
        </Link>
      ))}
    </div>
  );
}
