import { createRoute, Link } from "@tanstack/react-router";

import { CreateLinearForm } from "@/components/streams/create-stream/create-linear-form";

import { Route as CreateRoute } from "./app.create";

export const Route = createRoute({
  getParentRoute: () => CreateRoute,
  path: "/linear",
  component: LinearCreatePage,
});

function LinearCreatePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted mb-2">
          <Link to="/app/create" className="hover:text-text no-underline hover:no-underline">
            Create
          </Link>
          <span>/</span>
          <span className="text-text">Linear</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Create Linear Stream</h1>
        <p className="mt-1 text-sm text-muted">
          Continuous token streaming over a set period. Tokens unlock every second.
        </p>
      </div>
      <CreateLinearForm />
    </div>
  );
}
