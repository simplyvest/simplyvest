import { useState } from "react";

import { isValidPubkey } from "@/components/streams/create-stream/utils";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAddOrgMember } from "@/hooks/use-org-api";
import { cn } from "@/utils/cn";

interface AddMemberFormProps {
  orgId: string;
  currentUserRole?: string;
}

export function AddMemberForm({ orgId, currentUserRole }: AddMemberFormProps) {
  const addMember = useAddOrgMember();
  const [wallet, setWallet] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

  const walletError = wallet && !isValidPubkey(wallet) ? "Invalid wallet address" : "";
  const canSubmit = wallet && !walletError && !addMember.isPending;

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    addMember.mutate(
      { orgId, userId: wallet, role },
      {
        onSuccess: () => {
          setWallet("");
          setRole("member");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-bg1 p-4">
      <h4 className="text-sm font-medium text-text mb-3">Add Member</h4>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Field label="Wallet Address" error={walletError}>
            <Input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="Wallet address"
            />
          </Field>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => setRole("member")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              role === "member" ? "bg-sol text-white shadow-sm" : "text-muted hover:text-text",
            )}
          >
            Member
          </button>
          {currentUserRole === "owner" && (
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                role === "admin" ? "bg-sol text-white shadow-sm" : "text-muted hover:text-text",
              )}
            >
              Admin
            </button>
          )}
        </div>
        <Button type="submit" disabled={!canSubmit}>
          {addMember.isPending ? "Adding..." : "Add"}
        </Button>
      </div>
      {addMember.isError && (
        <p className="mt-2 text-xs text-warn">
          {addMember.error instanceof Error ? addMember.error.message : "Failed to add member"}
        </p>
      )}
    </form>
  );
}
