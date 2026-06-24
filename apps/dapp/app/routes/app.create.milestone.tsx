import { createRoute, Link } from "@tanstack/react-router";

import { CreateMilestoneForm } from "@/components/streams/create-stream/create-milestone-form";

import { Route as CreateRoute } from "./app.create";

export const Route = createRoute({
  getParentRoute: () => CreateRoute,
  path: "/milestone",
  component: MilestoneCreatePage,
});

function MilestoneCreatePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted mb-2">
          <Link to="/app/create" className="hover:text-text no-underline hover:no-underline">
            Create
          </Link>
          <span>/</span>
          <span className="text-text">Milestone</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Create Milestone Stream</h1>
        <p className="mt-1 text-sm text-muted">
          Tokens are released when a milestone authority approves each milestone.
        </p>
      </div>
      <CreateMilestoneForm />
    </div>
  );
}
