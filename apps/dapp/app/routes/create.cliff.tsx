import { createRoute, Link } from "@tanstack/react-router";

import { CreateCliffForm } from "@/components/streams/create-stream/create-cliff-form";

import { Route as CreateRoute } from "./create";

export const Route = createRoute({
  getParentRoute: () => CreateRoute,
  path: "/cliff",
  component: CliffCreatePage,
});

function CliffCreatePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted mb-2">
          <Link to="/create" className="hover:text-text no-underline hover:no-underline">
            Create
          </Link>
          <span>/</span>
          <span className="text-text">Cliff</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Create Cliff Stream</h1>
        <p className="mt-1 text-sm text-muted">
          Tokens are locked until a cliff date, then stream linearly until end.
        </p>
      </div>
      <CreateCliffForm />
    </div>
  );
}
