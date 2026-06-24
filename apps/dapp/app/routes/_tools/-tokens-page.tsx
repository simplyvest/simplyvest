import { Button } from "@simplyvest/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { LuPlus } from "react-icons/lu";

import { TokenList } from "@/components/tools/token-list";

export function TokensPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Your Tokens</h2>
        <Button variant="outline" onClick={() => navigate({ to: "/app/tools/create-token" })}>
          <LuPlus className="mr-2 h-4 w-4" />
          Create Token
        </Button>
      </div>
      <TokenList />
    </div>
  );
}
