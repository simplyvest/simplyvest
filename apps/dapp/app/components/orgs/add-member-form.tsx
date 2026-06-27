import { Button } from "@simplyvest/ui/button";
import { cn } from "@simplyvest/ui/cn";
import { Field } from "@simplyvest/ui/field";
import { Input } from "@simplyvest/ui/input";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

import { useAddOrgMember } from "@/hooks/use-org-api";

function isValidAddress(s: string): boolean {
  try {
    return !!new PublicKey(s);
  } catch {
    return false;
  }
}

interface AddMemberFormProps {
  orgId: string;
  currentUserRole?: string;
}

export function AddMemberForm({ orgId, currentUserRole }: AddMemberFormProps) {
  const addMember = useAddOrgMember();
  const [wallet, setWallet] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [validationError, setValidationError] = useState<string | null>(null);

  const canSubmit = wallet && !validationError && !addMember.isPending;

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!wallet) return;
    if (!isValidAddress(wallet)) {
      setValidationError("Invalid wallet address");
      return;
    }
    setValidationError(null);
    addMember.mutate(
      { orgId, userId: wallet, role },
      {
        onSuccess: () => {
          setWallet("");
          setRole("member");
          setValidationError(null);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-bg1 p-4">
      <h4 className="text-sm font-medium text-text mb-3">Add Member</h4>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Field label="Wallet Address" error={validationError ?? undefined}>
            <Input
              value={wallet}
              onChange={(e) => {
                setWallet(e.target.value);
                setValidationError(null);
              }}
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
              role === "member" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-text",
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
                role === "admin" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-text",
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
