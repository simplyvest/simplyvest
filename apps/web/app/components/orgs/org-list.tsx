import { useState } from "react";
import { useCreateOrg, useUserOrgs } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function OrgList() {
  const { data: orgs, isLoading } = useUserOrgs();
  const createOrg = useCreateOrg();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-bg2" />
        ))}
      </div>
    );
  }

  const handleCreate = () => {
    if (!name || !slug) return;
    createOrg.mutate(
      { name, slug },
      {
        onSuccess: () => {
          setName("");
          setSlug("");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {orgs && orgs.length > 0 ? (
        <div className="space-y-3">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="flex items-center justify-between rounded-xl border border-border bg-bg1 p-4"
            >
              <div>
                <p className="font-medium text-text">{org.name}</p>
                <p className="text-xs text-dim">/{org.slug}</p>
              </div>
              <span className="rounded-full bg-sol/10 px-3 py-1 text-xs font-medium text-sol">
                {org.role}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-bg1 p-6 text-center">
          <p className="text-sm text-muted">No organizations yet</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-bg1 p-6">
        <h4 className="font-medium text-text">Create Organization</h4>
        <div className="mt-4 space-y-3">
          <Field label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Organization"
            />
          </Field>
          <Field label="Slug">
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="my-organization"
            />
          </Field>
          <Button onClick={handleCreate} disabled={!name || !slug || createOrg.isPending}>
            {createOrg.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
