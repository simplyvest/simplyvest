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
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/app/create" className="hover:text-text no-underline hover:no-underline">
          Create
        </Link>
        <span>/</span>
        <span className="text-text">Milestone</span>
      </div>
      <CreateMilestoneForm />
    </div>
  );
}
