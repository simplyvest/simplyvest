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
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/app/create" className="hover:text-text no-underline hover:no-underline">
          Create
        </Link>
        <span>/</span>
        <span className="text-text">Linear</span>
      </div>
      <CreateLinearForm />
    </div>
  );
}
