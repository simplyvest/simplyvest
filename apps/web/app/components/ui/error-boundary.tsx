import * as Sentry from "@sentry/react";
import * as React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="mx-auto max-w-md text-center">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900/50 dark:bg-red-950/20">
              <h2 className="text-xl font-semibold text-text">Something went wrong</h2>
              <p className="mt-2 text-sm text-muted">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              {this.state.error && (
                <p className="mt-3 rounded-lg bg-red-100 p-3 font-mono text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {this.state.error.message}
                </p>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/25 hover:brightness-110 transition-all"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
