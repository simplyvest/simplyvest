import { test as base, type Page } from "@playwright/test";

/**
 * Mock an authenticated Solana wallet via Privy by intercepting
 * Privy's API and WebSocket calls. Returns a page pre-configured
 * with a connected wallet.
 *
 * This avoids needing a real wallet extension or Privy social login.
 */
export async function mockAuthenticatedWallet(page: Page) {
  // Intercept Privy's REST API to return a mock user
  await page.route("**/api/v1/users/me**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "test-user-123",
        created_at: Date.now(),
        linked_accounts: [
          {
            type: "wallet",
            address: "DRpbCBMxVnDK7maPMpNpowE5J5fB4suoA1YpF8fZQmYP",
            chain_type: "solana",
            wallet_client: "privy",
          },
        ],
      }),
    });
  });

  // Set localStorage values that Privy checks before making API calls
  await page.addInitScript(() => {
    const privyToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIn0.fake-signature";
    localStorage.setItem("privy:token", privyToken);
    localStorage.setItem("privy:session", JSON.stringify({ userId: "test-user-123" }));
  });
}

export const test = base;
export { expect } from "@playwright/test";
