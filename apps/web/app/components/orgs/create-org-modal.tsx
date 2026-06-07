import { useState } from "react";
import { LuX } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { useCreateOrg } from "@/hooks/use-api";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface CreateOrgModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (orgId: string) => void;
}

export function CreateOrgModal({ open, onClose, onSuccess }: CreateOrgModalProps) {
  const createOrg = useCreateOrg();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  if (!open) return null;

  const slugError =
    slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
      ? "Lowercase letters, numbers, and hyphens only"
      : "";

  const canSubmit = name && slug && !slugError && !createOrg.isPending;

  const handleNameBlur = () => {
    if (!slugEdited) {
      setSlug(slugify(name));
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    createOrg.mutate(
      { name, slug },
      {
        onSuccess: (org) => {
          handleClose();
          onSuccess?.(org.id);
        },
      },
    );
  };

  const handleClose = () => {
    setName("");
    setSlug("");
    setSlugEdited(false);
    onClose();
  };

  return (
    <ModalOverlay onClose={handleClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">Create Organization</h2>
        <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close">
          <LuX className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <Field label="Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="My Organization"
          />
        </Field>

        <Field label="Slug" required error={slugError}>
          <Input
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugEdited(true);
            }}
            placeholder="my-organization"
          />
        </Field>

        {createOrg.isError && (
          <p className="text-sm text-warn">
            {createOrg.error instanceof Error ? createOrg.error.message : "Failed to create"}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="default" onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
            {createOrg.isPending ? "Creating..." : "Create Organization"}
          </Button>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}
