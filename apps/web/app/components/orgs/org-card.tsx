import { Link } from "@tanstack/react-router";
import { LuUsers } from "react-icons/lu";

interface OrgCardProps {
  id: string;
  name: string;
  slug: string;
  role: string;
  memberCount?: number;
}

export function OrgCard({ id, name, slug, role, memberCount }: OrgCardProps) {
  return (
    <Link
      to="/app/organizations/$orgId"
      params={{ orgId: id }}
      className="flex flex-col rounded-xl border border-border bg-bg1 p-5 transition-colors hover:border-sol/30 hover:bg-bg2 no-underline hover:no-underline"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-text">{name}</p>
          <p className="mt-0.5 text-xs text-dim">/{slug}</p>
        </div>
        <span className="rounded-full bg-sol/10 px-2.5 py-0.5 text-xs font-medium text-sol capitalize">
          {role}
        </span>
      </div>
      {memberCount !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <LuUsers className="h-3.5 w-3.5" />
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </div>
      )}
    </Link>
  );
}
