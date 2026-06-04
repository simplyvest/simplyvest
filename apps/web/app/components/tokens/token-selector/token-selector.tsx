import { useState, useRef, useEffect } from "react";

import { CustomTokenInput } from "./custom-token-input";
import { OwnedTokenSelect } from "./owned-token-select";
import { useOwnedTokens, mintToAddress } from "./use-owned-tokens";

export function TokenSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (mintAddress: string) => void;
}) {
  const { tokens, loading } = useOwnedTokens();
  const [mode, setMode] = useState<"owned" | "custom">("owned");
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    if (tokens.length > 0 && !valueRef.current) {
      onChangeRef.current(mintToAddress(tokens[0].mint));
    }
  }, [tokens]);

  if (mode === "custom") {
    return (
      <CustomTokenInput
        value={value}
        onChange={onChange}
        onSwitchToOwned={() => setMode("owned")}
      />
    );
  }

  return (
    <OwnedTokenSelect
      tokens={tokens}
      loading={loading}
      value={value}
      onChange={onChange}
      onSwitchToCustom={() => setMode("custom")}
    />
  );
}
