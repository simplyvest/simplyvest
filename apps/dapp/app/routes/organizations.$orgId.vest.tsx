import { createRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LuArrowLeft, LuUser, LuUsers } from "react-icons/lu";

import type { EligibleMember } from "@/components/orgs/member-picker";
import { useOrg } from "@/hooks/use-org-api";
import { useAuth } from "@/lib/solana/use-auth";

import { Route as OrganizationsOrgIdRoute } from "./organizations.$orgId";

export const Route = createRoute({
  getParentRoute: () => OrganizationsOrgIdRoute,
  path: "/vest",
  component: VestPage,
});

function VestPage() {
  const { orgId } = Route.useParams();
  const location = useRouterState().location;
  const { data: org, isLoading } = useOrg(orgId);
  const { publicKey, privyId } = useAuth();

  const isExact = location.pathname === `/organizations/${orgId}/vest`;

  const walletMatch = publicKey?.toBase58() ?? null;
  const currentUserRole = org?.members.find(
    (m) => (walletMatch && m.walletAddress === walletMatch) || (privyId && m.privyId === privyId),
  )?.role;
  const isOwner = currentUserRole === "owner";

  const eligibleMembers: EligibleMember[] = (org?.members ?? []).filter(
    (m): m is EligibleMember => m.role !== "owner" && typeof m.walletAddress === "string",
  );

  if (!isExact) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-bg2" />
        <div className="h-48 animate-pulse rounded-xl bg-bg2" />
      </div>
    );
  }

  if (!org) {
    return <div>Organization not found</div>;
  }

  if (!isOwner) {
    return (
      <div className="rounded-xl border border-border bg-bg1 p-8 text-center">
        <p className="text-sm text-muted">Only the organization owner can vest tokens</p>
        <Link
          to="/organizations/$orgId"
          params={{ orgId }}
          className="mt-2 inline-block text-sm text-primary hover:underline no-underline"
        >
          Back to organization
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/organizations/$orgId"
          params={{ orgId }}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text no-underline hover:no-underline mb-4"
        >
          <LuArrowLeft className="h-3.5 w-3.5" />
          Back to {org.name}
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-text">Vest Tokens</h1>
        <p className="mt-1 text-sm text-muted">
          {org.tokenSymbol
            ? `Choose how to distribute ${org.tokenSymbol} to members`
            : "No token linked to this organization"}
        </p>
      </div>

      {!org.mintAddress ? (
        <div className="rounded-xl border border-border bg-bg1 p-8 text-center">
          <p className="text-sm text-muted">Link a token first before vesting</p>
          <Link
            to="/organizations/$orgId"
            params={{ orgId }}
            className="mt-2 inline-block text-sm text-primary hover:underline no-underline"
          >
            Back to organization
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/organizations/$orgId/vest/individual"
            params={{ orgId }}
            className="rounded-xl border border-border bg-bg1 p-6 transition-colors hover:border-primary/30 hover:bg-bg2 no-underline block"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <LuUser className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text">Vest to Individual</h3>
                <p className="mt-1 text-sm text-muted">
                  Pick one member and set their vesting schedule
                </p>
                <p className="mt-2 text-xs text-dim">
                  {eligibleMembers.length} eligible member{eligibleMembers.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/organizations/$orgId/vest/all"
            params={{ orgId }}
            className="rounded-xl border border-border bg-bg1 p-6 transition-colors hover:border-primary/30 hover:bg-bg2 no-underline block"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <LuUsers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text">Vest to All</h3>
                <p className="mt-1 text-sm text-muted">
                  Share a pool of tokens equally across all members
                </p>
                <p className="mt-2 text-xs text-dim">
                  {eligibleMembers.length} eligible member{eligibleMembers.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
