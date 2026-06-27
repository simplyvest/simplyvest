import { Badge } from "@/components/ui/badge";

export interface EligibleMember {
  userId: string;
  role: "owner" | "admin" | "member";
  walletAddress: string;
  displayName: string | null;
  joinedAt: Date;
  privyId: string | null;
}

interface MemberPickerProps {
  members: EligibleMember[];
  value: string | null;
  onChange: (member: EligibleMember) => void;
}

export function MemberPicker({ members, value, onChange }: MemberPickerProps) {
  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-bg1 p-6 text-center">
        <p className="text-sm text-muted">No eligible members</p>
        <p className="mt-1 text-xs text-dim">
          Members must have a wallet address to receive vesting streams
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const selected = value === member.userId;
        return (
          <button
            key={member.userId}
            type="button"
            onClick={() => onChange(member)}
            className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
              selected
                ? "border-primary bg-primary/5"
                : "border-border bg-bg1 hover:border-primary/30 hover:bg-bg2"
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">
                {member.displayName ??
                  `${member.walletAddress.slice(0, 6)}...${member.walletAddress.slice(-4)}`}
              </p>
              <p className="truncate text-xs text-dim font-mono mt-0.5">
                {member.walletAddress.slice(0, 8)}...{member.walletAddress.slice(-6)}
              </p>
            </div>
            <div className="ml-3 shrink-0">
              <Badge variant={member.role === "admin" ? "info" : "primary"}>{member.role}</Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}
