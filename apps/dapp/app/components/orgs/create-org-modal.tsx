import { Button } from "@simplyvest/ui/button";
import { Field } from "@simplyvest/ui/field";
import { Input } from "@simplyvest/ui/input";
import { useState } from "react";
import { LuX } from "react-icons/lu";

import { ModalOverlay } from "@/components/ui/modal-overlay";
import { useCreateOrg } from "@/hooks/use-org-api";

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
  const [description, setDescription] = useState("");

  if (!open) return null;

  const slugError =
    slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
      ? "Lowercase letters, numbers, and hyphens only"
      : "";

  const canSubmit = name && slug && !slugError && !createOrg.isPending;

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    createOrg.mutate(
      { name, slug, description: description || undefined },
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
    setDescription("");
    onClose();
  };

  return (
    <ModalOverlay onClose={handleClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">Create Organization</h2>
        <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close" type="button">
          <LuX className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name" required>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="My Organization"
            autoFocus
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
          {!slugEdited && slug && <p className="mt-1 text-xs text-dim">Auto-generated from name</p>}
        </Field>

        <Field label="Description">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this organization do?"
          />
        </Field>

        {createOrg.isError && (
          <p className="text-sm text-warn">
            {createOrg.error instanceof Error ? createOrg.error.message : "Failed to create"}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="default" disabled={!canSubmit} className="flex-1">
            {createOrg.isPending ? "Creating..." : "Create Organization"}
          </Button>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </form>
    </ModalOverlay>
  );
}
