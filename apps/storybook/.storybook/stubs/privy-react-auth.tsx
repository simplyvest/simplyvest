// Storybook stub for @privy-io/react-auth
// Prevents "Cannot read properties of null" crashes in the dev server
// by providing no-op implementations of all Privy hooks.

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export function usePrivy() {
  return {
    ready: true,
    authenticated: false,
    user: null,
    getAccessToken: () => Promise.resolve(null),
    login: () => {},
    logout: () => {},
  };
}

export function useLogin() {
  return { login: () => {} };
}

export function useLogout() {
  return { logout: () => {} };
}

export { type WalletWithMetadata } from "@privy-io/react-auth";
