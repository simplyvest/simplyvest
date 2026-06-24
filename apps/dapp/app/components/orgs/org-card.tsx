import { Link } from "@tanstack/react-router";
import { LuUsers } from "react-icons/lu";

interface OrgCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  role: string;
  memberCount?: number;
}

export function OrgCard({ id, name, slug, description, role, memberCount }: OrgCardProps) {
  return (
    <Link
      to="/app/organizations/$orgId"
      params={{ orgId: id }}
      className="flex flex-col rounded-xl border border-border bg-bg1 p-5 transition-colors hover:border-primary/30 hover:bg-bg2 no-underline hover:no-underline"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-text">{name}</p>
          <p className="mt-0.5 text-xs text-dim">/{slug}</p>
          {description && <p className="mt-1.5 text-sm text-muted line-clamp-2">{description}</p>}
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize ml-3 shrink-0">
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
