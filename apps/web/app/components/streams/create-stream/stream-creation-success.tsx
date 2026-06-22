import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useSolanaCluster } from "@/lib/solana/use-solana-cluster";

export function StreamCreationSuccess({
  txSignature,
  streamPda,
  onReset,
}: {
  txSignature: string;
  streamPda: string;
  onReset: () => void;
}) {
  const cluster = useSolanaCluster();
  const navigate = useNavigate();
  const explorerTxUrl = `https://explorer.solana.com/tx/${txSignature}?cluster=${cluster}`;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-success/30 bg-success/5 px-8 py-12 text-center">
      <p className="text-lg font-semibold text-success">Stream Created!</p>
      <p className="mt-1 text-sm text-muted">
        Transaction:{" "}
        <a
          href={explorerTxUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-success underline underline-offset-2 hover:text-success/80"
        >
          {txSignature}
        </a>
      </p>
      <div className="mt-4 flex gap-3">
        <Button variant="outline" onClick={onReset}>
          Create Another
        </Button>
        <Button onClick={() => navigate({ to: "/app/streams/$streamPda", params: { streamPda } })}>
          View Stream
        </Button>
      </div>
    </div>
  );
}
