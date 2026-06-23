import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LuArrowLeft, LuTrash2 } from "react-icons/lu";

import { EditOrgForm } from "@/components/orgs/edit-org-form";
import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { useDeleteOrg, useOrg } from "@/hooks/use-org-api";
import { useAuth } from "@/lib/solana/use-auth";

import { Route as OrganizationsRoute } from "./app.organizations";

export const Route = createRoute({
  getParentRoute: () => OrganizationsRoute,
  path: "/$orgId/edit",
  component: EditOrgPage,
});

function EditOrgPage() {
  const { orgId } = Route.useParams();
  const navigate = useNavigate();
  const { data: org, isLoading, error } = useOrg(orgId);
  const { publicKey } = useAuth();
  const deleteOrg = useDeleteOrg();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const currentUserRole = org?.members.find((m) => m.walletAddress === publicKey?.toBase58())?.role;
  const isOwner = currentUserRole === "owner";
  const nameMatch = confirmName === org?.name;

  const handleDelete = () => {
    deleteOrg.mutate(orgId, {
      onSuccess: () => {
        void navigate({ to: "/app/organizations" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-bg2" />
        <div className="h-8 w-48 animate-pulse rounded bg-bg2" />
        <div className="h-64 animate-pulse rounded-xl bg-bg2" />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="rounded-xl border border-border bg-bg1 p-8 text-center">
        <p className="text-sm text-muted">Organization not found</p>
        <Link
          to="/app/organizations"
          className="mt-2 inline-block text-sm text-primary hover:underline no-underline"
        >
          Back to organizations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/app/organizations/$orgId"
          params={{ orgId }}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text no-underline hover:no-underline mb-4"
        >
          <LuArrowLeft className="h-3.5 w-3.5" />
          Back to {org.name}
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-text">Organization Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your organization settings</p>
      </div>

      {/* Settings section */}
      <EditOrgForm
        orgId={orgId}
        currentName={org.name}
        currentSlug={org.slug}
        currentDescription={org.description}
      />

      {/* Danger Zone */}
      {isOwner && (
        <div className="rounded-xl border border-warn/30 bg-warn/5 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-warn/10 p-2 mt-0.5">
              <LuTrash2 className="h-5 w-5 text-warn" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-text">Delete Organization</h2>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                Permanently delete <strong>{org.name}</strong> and all its member associations.
                On-chain tokens and vesting streams are not affected.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-4"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <LuTrash2 className="h-4 w-4 mr-1.5" />
                Delete Organization
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isOwner && <p className="text-xs text-muted">Only the organization owner can delete it.</p>}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <ModalOverlay
          onClose={() => {
            setShowDeleteConfirm(false);
            setConfirmName("");
          }}
        >
          <div className="rounded-xl border border-border bg-bg1 p-6 max-w-md mx-auto mt-20">
            <h3 className="text-lg font-semibold text-text">Delete Organization?</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              This action cannot be undone. Type <strong>{org.name}</strong> below to confirm.
            </p>
            <input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={`Type "${org.name}" to confirm`}
              className="mt-4 w-full rounded-lg border border-border bg-bg2 px-3 py-2 text-sm text-text placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConfirmName("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!nameMatch || deleteOrg.isPending}
                onClick={handleDelete}
              >
                {deleteOrg.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
            {deleteOrg.isError && (
              <p className="mt-2 text-xs text-warn">
                {deleteOrg.error instanceof Error ? deleteOrg.error.message : "Failed to delete"}
              </p>
            )}
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
