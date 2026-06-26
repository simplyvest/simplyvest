import { useStreamEvents } from "@/hooks/use-stream-events";

import { StreamEventItem } from "./stream-event-item";

export function StreamEventList({ pda }: { pda: string }) {
  const { data, isLoading, isError } = useStreamEvents(pda);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text">Event History</h3>
        <p className="text-sm text-dim">Loading events...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text">Event History</h3>
        <p className="text-sm text-dim">Failed to load events</p>
      </div>
    );
  }

  const events = data.events ?? [];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text">Event History</h3>
      {events.length === 0 ? (
        <p className="text-sm text-dim">No events recorded</p>
      ) : (
        <div className="divide-y divide-border">
          {events.map((event) => (
            <StreamEventItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
