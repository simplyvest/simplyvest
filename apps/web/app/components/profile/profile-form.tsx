import { usePrivy, type WalletWithMetadata } from "@privy-io/react-auth";
import { useExportWallet } from "@privy-io/react-auth/solana";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUserProfile, useCreateProfile, useUpdateProfile } from "@/hooks/use-api";
import { useAuth } from "@/lib/solana/use-auth";

function ExportWalletButton() {
  const { ready, authenticated, user } = usePrivy();
  const { exportWallet } = useExportWallet();

  const isAuthenticated = ready && authenticated;
  const hasEmbeddedWallet = !!user?.linkedAccounts.find(
    (account): account is WalletWithMetadata =>
      account.type === "wallet" &&
      account.walletClientType === "privy" &&
      account.chainType === "solana",
  );

  return (
    <Button
      variant="outline"
      onClick={() => exportWallet()}
      disabled={!isAuthenticated || !hasEmbeddedWallet}
    >
      Export Wallet
    </Button>
  );
}

export function ProfileForm() {
  const { publicKey, user: authUser } = useAuth();
  const { data: profile, isLoading } = useUserProfile();
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");

  // Auto-create profile on first visit if it doesn't exist
  useEffect(() => {
    if (!isLoading && profile === null && publicKey && !createProfile.isPending) {
      createProfile.mutate({
        walletAddress: publicKey.toBase58(),
        email: authUser?.email,
        displayName: authUser?.email?.split("@")[0],
      });
    }
  }, [isLoading, profile, publicKey, createProfile, authUser]);

  // Update form fields when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setEmail(profile.email ?? "");
    }
  }, [profile]);

  if (isLoading || createProfile.isPending) {
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
        <p className="text-sm text-muted">Setting up your profile...</p>
      </div>
    );
  }

  const handleSave = () => {
    updateProfile.mutate({ displayName, email });
  };

  return (
    <div className="space-y-6">
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

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-medium text-text">Wallet</h4>
        <p className="mt-1 text-xs text-muted">
          Export your embedded wallet private key to use with other wallets like Phantom or
          MetaMask.
        </p>
        <div className="mt-3">
          <ExportWalletButton />
        </div>
      </div>
    </div>
  );
}
