import { createRoute, Outlet, useRouterState } from "@tanstack/react-router";

import { CreateTypeSelector } from "@/components/streams/create-stream/create-type-selector";

import { Route as AppRoute } from "./app";

export const Route = createRoute({
  getParentRoute: () => AppRoute,
  path: "/create",
  component: CreatePage,
});

function CreatePage() {
  const location = useRouterState().location;
  const isExactCreate = location.pathname === "/app/create";

  if (!isExactCreate) {
    return <Outlet />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text">Create Stream</h1>
        <p className="mt-1 text-sm text-muted">Choose a stream type to get started</p>
      </div>
      <CreateTypeSelector />
    </div>
  );
}
