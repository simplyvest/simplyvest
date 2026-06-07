import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAddOrgMember } from "@/hooks/use-api";
import { isValidPubkey } from "@/components/streams/create-stream/utils";

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

  const handleSubmit = () => {
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
    <div className="rounded-lg border border-border bg-bg1 p-4">
      <h4 className="text-sm font-medium text-text mb-3">Add Member</h4>
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Wallet Address" error={walletError}>
            <Input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="Wallet address"
            />
          </Field>
        </div>
        <div className="w-32">
          <Select
            value={role}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "admin" || v === "member") setRole(v);
            }}
          >
            <option value="member">Member</option>
            {currentUserRole === "owner" && <option value="admin">Admin</option>}
          </Select>
        </div>
        <Button onClick={handleSubmit} disabled={!canSubmit} className="self-start">
          {addMember.isPending ? "Adding..." : "Add"}
        </Button>
      </div>
      {addMember.isError && (
        <p className="mt-2 text-xs text-warn">
          {addMember.error instanceof Error ? addMember.error.message : "Failed to add member"}
        </p>
      )}
    </div>
  );
}
