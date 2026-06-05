import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useTokenInfo } from "./use-token-info";

export function CustomTokenInput({
  value,
  onChange,
  onSwitchToOwned,
}: {
  value: string;
  onChange: (mintAddress: string) => void;
  onSwitchToOwned: () => void;
}) {
  const { label, error, loading } = useTokenInfo(value);

  return (
    <Field label="Token Mint Address" required>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Enter SPL token mint address"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={onSwitchToOwned}>
            Owned
          </Button>
        </div>

        {loading && <p className="text-xs text-muted animate-pulse">Resolving token…</p>}
        {error && <p className="text-xs text-warn">{error}</p>}
        {label && !loading && <p className="text-xs text-muted">{label}</p>}
      </div>
    </Field>
  );
}
