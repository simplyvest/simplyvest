import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

import { ThemeProvider } from "../app/lib/theme";

/**
 * Storybook decorator that provides the minimal provider chain
 * needed by most components: QueryClient + Theme.
 *
 * Components that need auth state should mock `@/lib/solana/use-auth` directly.
 *
 * Usage in story files:
 * ```ts
 * import { withProviders } from "../../../.storybook/decorators";
 *
 * const meta = {
 *   component: MyComponent,
 *   decorators: [withProviders],
 * } satisfies Meta<typeof MyComponent>;
 * ```
 */
export function withProviders(Story: () => ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
