import { type ReactElement } from "react";
import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import {
  createRouter,
  RouterProvider,
  createRootRoute,
  createRoute,
  createMemoryHistory,
} from "@tanstack/react-router";

type RouterOptions = {
  initialEntries?: string[];
};

export function renderWithRouter(
  component: ReactElement,
  options: RenderOptions & RouterOptions = {},
): RenderResult {
  const { initialEntries = ["/"], ...renderOptions } = options;

  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => component,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries }),
    defaultViewTransition: false,
  });

  return render(<RouterProvider router={router} />, renderOptions);
}
