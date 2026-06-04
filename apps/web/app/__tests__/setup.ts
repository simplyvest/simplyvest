// Mock window.matchMedia for ThemeProvider
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

// Mock @ledgerhq/errors which has a module resolution issue
// when transitively loaded through Solana wallet adapter in jsdom.
vi.mock("@ledgerhq/errors", () => ({
  default: {},
}));
import "@testing-library/jest-dom";
import { Buffer } from "buffer";

globalThis.Buffer = Buffer;
