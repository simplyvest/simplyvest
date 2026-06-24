import { Badge } from "@/components/ui/badge";
import type { StreamStatus } from "@/hooks/use-stream-detail";

const statusConfig: Record<StreamStatus, { label: string; variant: "sol" | "sol2" | "warn" }> = {
  active: { label: "Active", variant: "sol" },
  completed: { label: "Completed", variant: "sol2" },
  cancelled: { label: "Cancelled", variant: "warn" },
};

export function StreamStatusBadge({ status }: { status: StreamStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
