// Mock window.matchMedia for ThemeProvider
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi
    .fn<
      (query: string) => {
        matches: boolean;
        media: string;
        onchange: null;
        addEventListener: (...args: unknown[]) => void;
        removeEventListener: (...args: unknown[]) => void;
      }
    >()
    .mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn<(...args: unknown[]) => void>(),
      removeEventListener: vi.fn<(...args: unknown[]) => void>(),
    })),
});

// Mock window.scrollTo (not implemented in jsdom)
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
window.scrollTo = vi.fn<(...args: unknown[]) => void>() as unknown as typeof window.scrollTo;

// Mock @ledgerhq/errors which has a module resolution issue
// when transitively loaded through Solana wallet adapter in jsdom.
vi.mock("@ledgerhq/errors", () => ({
  default: {},
}));
import "@testing-library/jest-dom";
import { Buffer } from "buffer";

globalThis.Buffer = Buffer;
