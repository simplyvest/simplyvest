import { ThemeProvider } from "@simplyvest/ui/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

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
        <div className="min-h-screen bg-bg text-text">
          <Story />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
