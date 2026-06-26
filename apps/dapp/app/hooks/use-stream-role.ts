import { useMemo } from "react";

import type { StreamDetail } from "./use-stream-detail";

type StreamRole = "creator" | "recipient" | "unknown";

export function useStreamRole(
  detail: StreamDetail | null,
  walletAddress: string | null | undefined,
): StreamRole {
  return useMemo(() => {
    if (!detail || !walletAddress) return "unknown";
    if (walletAddress === detail.creator) return "creator";
    if (walletAddress === detail.recipient) return "recipient";
    return "unknown";
  }, [detail, walletAddress]);
}

export type { StreamRole };
