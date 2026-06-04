import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function CustomTokenInput({
  value,
  onChange,
  onSwitchToOwned,
}: {
  value: string;
  onChange: (mintAddress: string) => void;
  onSwitchToOwned: () => void;
}) {
  return (
    <Field label="Token Mint Address" required>
      <div className="flex gap-2">
        <Input
          placeholder="Enter SPL token mint address"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        <button
          type="button"
          onClick={onSwitchToOwned}
          className="rounded-md border border-border2 bg-bg2 px-3 py-2 text-sm text-muted transition-colors hover:text-text"
        >
          Owned
        </button>
      </div>
    </Field>
  );
}
