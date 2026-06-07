import { useUserOrgs } from "@/hooks/use-api";

import { OrgCard } from "./org-card";

export function OrgList() {
  const { data: orgs, isLoading } = useUserOrgs();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-bg2" />
        ))}
      </div>
    );
  }

  if (!orgs || orgs.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orgs.map((org) => (
        <OrgCard
          key={org.id}
          id={org.id}
          name={org.name}
          slug={org.slug}
          description={org.description}
          role={org.role}
        />
      ))}
    </div>
  );
}
