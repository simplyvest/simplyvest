import { createFileRoute } from "@tanstack/react-router";

import { CancelButton } from "@/components/streams/detail/cancel-button";
import { ClaimButton } from "@/components/streams/detail/claim-button";
import { StreamAddresses } from "@/components/streams/detail/stream-addresses";
import { StreamAmounts } from "@/components/streams/detail/stream-amounts";
import { StreamDetailGrid } from "@/components/streams/detail/stream-detail-grid";
import { StreamDetailLayout } from "@/components/streams/detail/stream-detail-layout";
import { StreamEventList } from "@/components/streams/detail/stream-event-list";
import { StreamTimeline } from "@/components/streams/detail/stream-timeline";
import { TriggerMilestoneButton } from "@/components/streams/detail/trigger-milestone-button";
import { useStreamDetail } from "@/hooks/use-stream-detail";
import { useStreamRole } from "@/hooks/use-stream-role";
import { useAuth } from "@/lib/solana/use-auth";

export const Route = createFileRoute("/streams/$streamPda")({
  component: StreamDetailPage,
});

function StreamDetailPage() {
  const { streamPda } = Route.useParams();
  const { publicKey } = useAuth();
  const { detail, isLoading, isError, error } = useStreamDetail(streamPda);
  const role = useStreamRole(detail, publicKey?.toBase58());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dim">Loading stream...</p>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg font-medium text-text">Stream not found</p>
        <p className="text-sm text-dim">
          {error instanceof Error ? error.message : "The stream could not be loaded"}
        </p>
      </div>
    );
  }

  return (
    <StreamDetailLayout
      streamType={detail.streamType}
      status={detail.status}
      tokenName={detail.tokenName}
      tokenSymbol={detail.tokenSymbol}
      mintAddress={detail.mint}
    >
      <StreamDetailGrid>
        <StreamAddresses detail={detail} />
        <StreamAmounts detail={detail} />
        <StreamTimeline detail={detail} />

        {role === "recipient" && <ClaimButton detail={detail} />}
        {role === "creator" && detail.status === "active" && <CancelButton detail={detail} />}
        {role === "creator" && detail.streamType === "milestone" && (
          <TriggerMilestoneButton detail={detail} />
        )}
      </StreamDetailGrid>

      <StreamEventList pda={streamPda} />
    </StreamDetailLayout>
  );
}
