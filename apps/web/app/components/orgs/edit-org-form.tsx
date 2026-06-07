import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateOrg } from "@/hooks/use-api";

interface EditOrgFormProps {
  orgId: string;
  currentName: string;
  currentSlug: string;
  onSuccess?: () => void;
}

export function EditOrgForm({ orgId, currentName, currentSlug, onSuccess }: EditOrgFormProps) {
  const updateOrg = useUpdateOrg(orgId);
  const [name, setName] = useState(currentName);

  const canSubmit = name && name !== currentName && !updateOrg.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    updateOrg.mutate(
      { name },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  return (
    <div className="rounded-lg border border-border bg-bg1 p-4">
      <h4 className="text-sm font-medium text-text mb-3">Organization Settings</h4>
      <div className="space-y-3">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Slug">
          <Input value={currentSlug} disabled />
        </Field>
        {updateOrg.isError && (
          <p className="text-xs text-warn">
            {updateOrg.error instanceof Error ? updateOrg.error.message : "Failed to update"}
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!canSubmit} size="sm">
            {updateOrg.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
