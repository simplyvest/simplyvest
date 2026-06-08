import { createRoute } from "@tanstack/react-router";

import { ProfileForm } from "@/components/profile/profile-form";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/profile",
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Profile</h1>
        <p className="mt-1 text-sm text-muted">Manage your profile information</p>
      </div>
      <ProfileForm />
    </div>
  );
}
