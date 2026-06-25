// Storybook 10.4.6 vendors vitest 3.x internally (expect, spy).
// When stories import "storybook/test", Vite pre-bundles the vendored
// vitest 3.x alongside our vitest 4.x, corrupting the cache.
//
// This stub re-exports from vitest 4.x (our project dep) instead of
// storybook's vendored vitest 3.x, preventing version conflicts.
export { fn } from "vitest";
export { expect, userEvent } from "@storybook/test";
