import { createRoute } from "@tanstack/react-router";

import { ProfileForm } from "@/components/profile/profile-form";
import { OrgList } from "@/components/orgs/org-list";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/settings",
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your account and organizations</p>
      </div>

      <ProfileForm />

      <div className="border-t border-border pt-10">
        <OrgList />
      </div>
    </div>
  );
}
