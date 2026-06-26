/** Polyfill Buffer for browser-mode Vitest (needed by @solana/spl-token). */
import { Buffer } from "buffer";

if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}
