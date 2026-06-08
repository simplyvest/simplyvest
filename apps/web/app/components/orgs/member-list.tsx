import { LuTrash2 } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { useRemoveOrgMember } from "@/hooks/use-api";

interface Member {
  userId: string;
  role: "owner" | "admin" | "member";
  walletAddress: string;
  displayName: string | null;
}

interface MemberListProps {
  orgId: string;
  members: Member[];
  currentUserId?: string;
  currentUserRole?: string;
}

export function MemberList({ orgId, members, currentUserId, currentUserRole }: MemberListProps) {
  const removeMember = useRemoveOrgMember();

  const canRemove = (member: Member) => {
    if (member.userId === currentUserId) return false;
    if (member.role === "owner") return false;
    if (currentUserRole === "owner") return true;
    if (currentUserRole === "admin" && member.role === "member") return true;
    return false;
  };

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.userId}
          className="flex items-center justify-between rounded-lg border border-border bg-bg1 px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">
              {member.displayName ??
                `${member.walletAddress.slice(0, 6)}...${member.walletAddress.slice(-4)}`}
            </p>
            <p className="truncate text-xs text-dim">{member.walletAddress}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="rounded-full bg-bg2 px-2.5 py-0.5 text-xs font-medium text-muted capitalize">
              {member.role}
            </span>
            {canRemove(member) && (
              <Button
                variant="ghost"
                size="icon"
                disabled={removeMember.isPending}
                onClick={() => removeMember.mutate({ orgId, userId: member.userId })}
                aria-label={`Remove ${member.displayName ?? "member"}`}
              >
                <LuTrash2 className="h-4 w-4 text-warn" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
