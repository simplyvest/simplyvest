import { Button } from "@/components/ui/button";

export function StreamCreationSuccess({
  txSignature,
  onReset,
}: {
  txSignature: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-sol2/30 bg-sol2/5 px-8 py-12 text-center">
      <p className="text-lg font-semibold text-sol2">Stream Created!</p>
      <p className="mt-1 text-sm text-muted">Transaction: {txSignature.slice(0, 16)}...</p>
      <Button variant="outline" className="mt-4" onClick={onReset}>
        Create Another
      </Button>
    </div>
  );
}
