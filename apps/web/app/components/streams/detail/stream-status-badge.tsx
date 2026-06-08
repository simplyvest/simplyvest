import { Badge } from "@/components/ui/badge";

const statusConfig = {
  active: { label: "Active", variant: "sol" as const },
  completed: { label: "Completed", variant: "sol2" as const },
  cancelled: { label: "Cancelled", variant: "warn" as const },
};

export function StreamStatusBadge({ status }: { status: "active" | "completed" | "cancelled" }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
