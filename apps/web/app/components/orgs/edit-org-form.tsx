import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateOrg } from "@/hooks/use-api";

interface EditOrgFormProps {
  orgId: string;
  currentName: string;
  currentSlug: string;
  currentDescription?: string | null;
  onSuccess?: () => void;
}

export function EditOrgForm({
  orgId,
  currentName,
  currentSlug,
  currentDescription,
  onSuccess,
}: EditOrgFormProps) {
  const updateOrg = useUpdateOrg(orgId);
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription ?? "");

  const hasChanges = name !== currentName || description !== (currentDescription ?? "");
  const canSubmit = name && hasChanges && !updateOrg.isPending;

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    updateOrg.mutate(
      { name, description: description || null },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-bg1 p-4">
      <h4 className="text-sm font-medium text-text mb-3">Organization Settings</h4>
      <div className="space-y-3">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Slug">
          <Input value={currentSlug} disabled />
        </Field>
        <Field label="Description">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this organization do?"
          />
        </Field>
        {updateOrg.isError && (
          <p className="text-xs text-warn">
            {updateOrg.error instanceof Error ? updateOrg.error.message : "Failed to update"}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={!canSubmit} size="sm">
            {updateOrg.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
