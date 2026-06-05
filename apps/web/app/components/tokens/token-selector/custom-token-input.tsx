import { Button } from "@/components/ui/button";
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
        <Button type="button" variant="outline" size="sm" onClick={onSwitchToOwned}>
          Owned
        </Button>
      </div>
    </Field>
  );
}
