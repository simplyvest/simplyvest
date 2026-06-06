import { useAuth } from "@/lib/solana/use-auth";
import { useUserProfile, useUpdateProfile } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function ProfileForm() {
  const { publicKey, user: authUser } = useAuth();
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded-lg bg-bg2" />
        <div className="h-10 animate-pulse rounded-lg bg-bg2" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-border bg-bg1 p-6 text-center">
        <p className="text-sm text-muted">Profile not found. It will be created on first login.</p>
      </div>
    );
  }

  const handleSave = () => {
    updateProfile.mutate({ displayName, email });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text">Profile</h3>
        <p className="text-sm text-muted">Manage your account details</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-bg2 p-4">
          <p className="text-xs text-dim">Wallet Address</p>
          <p className="mt-1 font-mono text-sm text-text">{profile.walletAddress}</p>
        </div>

        {authUser?.email && (
          <div className="rounded-lg bg-bg2 p-4">
            <p className="text-xs text-dim">Login Email</p>
            <p className="mt-1 text-sm text-text">{authUser.email}</p>
          </div>
        )}

        {authUser?.google && (
          <div className="rounded-lg bg-bg2 p-4">
            <p className="text-xs text-dim">Google Account</p>
            <p className="mt-1 text-sm text-text">{authUser.google}</p>
          </div>
        )}

        <Field label="Display Name">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
          />
        </Field>

        <Field label="Email (for notifications)">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </Field>

        <Button onClick={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
