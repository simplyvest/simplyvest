/**
 * Type guard that narrows an unknown value to {@link Record Record<string, unknown>}.
 * Replaces unsafe `as Record<string, unknown>` assertions at call sites.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
