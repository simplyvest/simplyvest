import { useState, useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface FormState {
  name: string;
  symbol: string;
  decimals: string;
  amount: string;
  image: File | null;
}

export function TokenCreatorForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: {
    name: string;
    symbol: string;
    decimals: number;
    amount: string;
    image?: File;
  }) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<FormState>({
    name: "",
    symbol: "",
    decimals: "9",
    amount: "0",
    image: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const update = (field: keyof FormState, val: string) => setForm((f) => ({ ...f, [field]: val }));

  const errors = useMemo(() => {
    const e: string[] = [];
    if (form.symbol && form.symbol.length > 10) e.push("Symbol max 10 characters");
    const dec = Number(form.decimals);
    if (isNaN(dec) || dec < 0 || dec > 9) e.push("Decimals must be 0-9");
    const amt = Number(form.amount);
    if (isNaN(amt) || amt <= 0) e.push("Amount must be positive");
    return e;
  }, [form]);

  const canSubmit =
    form.name.trim() && form.symbol.trim() && form.amount && errors.length === 0 && !isPending;

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, image: file }));
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const result = reader.result;
      if (typeof result === "string") setImagePreview(result);
    });
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm((f) => ({ ...f, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    const dec = Number(form.decimals);
    onSubmit({
      name: form.name.trim(),
      symbol: form.symbol.trim().toUpperCase(),
      decimals: isNaN(dec) ? 9 : dec,
      amount: form.amount,
      image: form.image ?? undefined,
    });
  };

  return (
    <div className="space-y-5">
      <Field label="Token Name" required>
        <Input
          placeholder="My Token"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          maxLength={32}
        />
      </Field>

      <div>
        <Field label="Symbol" required>
          <Input
            placeholder="TKN"
            value={form.symbol}
            onChange={(e) => update("symbol", e.target.value.toUpperCase())}
            maxLength={10}
          />
        </Field>
        <p className="mt-1 text-xs text-muted">Max 10 characters</p>
      </div>

      <div>
        <Field label="Decimals" required>
          <Input
            type="number"
            min={0}
            max={9}
            value={form.decimals}
            onChange={(e) => update("decimals", e.target.value)}
          />
        </Field>
        <p className="mt-1 text-xs text-muted">0 = NFT, 9 = typical SPL token</p>
      </div>

      <div>
        <Field label="Initial Supply" required>
          <Input
            type="number"
            min="0"
            step="any"
            placeholder="1000000"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
          />
        </Field>
        <p className="mt-1 text-xs text-muted">Token amount (not raw units)</p>
      </div>

      <div>
        <p className="text-sm font-medium text-text">Token Icon</p>
        <p className="mt-1 text-xs text-muted">Optional. Max 2MB, auto-compressed to 512px WebP</p>
        <div className="mt-1.5 flex items-center gap-3">
          <Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()}>
            Choose Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleImage}
          />
          {form.image && (
            <Button variant="ghost" type="button" onClick={handleRemoveImage}>
              Remove
            </Button>
          )}
        </div>
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-2 h-16 w-16 rounded-lg object-cover border border-border"
          />
        )}
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-warn/30 bg-warn/5 p-3">
          <ul className="text-sm text-warn list-disc list-inside">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <Button variant="default" onClick={handleSubmit} disabled={!canSubmit} className="w-full">
        {isPending ? "Creating Token..." : "Create Token"}
      </Button>
    </div>
  );
}
