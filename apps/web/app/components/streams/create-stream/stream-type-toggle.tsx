interface StreamTypeToggleProps {
  streamType: "time" | "milestone";
  onChange: (type: "time" | "milestone") => void;
}

export function StreamTypeToggle({ streamType, onChange }: StreamTypeToggleProps) {
  return (
    <div className="flex rounded-lg border border-border bg-bg1 p-0.5">
      {(["time", "milestone"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            streamType === t ? "bg-sol text-white shadow-sm" : "text-muted hover:text-text"
          }`}
        >
          {t === "time" ? "Time-based Vesting" : "Milestone-gated"}
        </button>
      ))}
    </div>
  );
}
