import { createRoute, Link } from "@tanstack/react-router";

import { CreateCliffForm } from "@/components/streams/create-stream/create-cliff-form";

import { Route as CreateRoute } from "./app.create";

export const Route = createRoute({
  getParentRoute: () => CreateRoute,
  path: "/cliff",
  component: CliffCreatePage,
});

function CliffCreatePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/app/create" className="hover:text-text no-underline hover:no-underline">
          Create
        </Link>
        <span>/</span>
        <span className="text-text">Cliff</span>
      </div>
      <CreateCliffForm />
    </div>
  );
}
