export type RpcAccountResult =
  | { status: "exists"; data: string }
  | { status: "not_found" }
  | { status: "error"; error: string };

export async function fetchAccountInfo(rpcUrl: string, address: string): Promise<RpcAccountResult> {
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [
          address,
          {
            encoding: "base64",
            commitment: "confirmed",
          },
        ],
      }),
    });

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const data = (await response.json()) as {
      result?: { value: unknown };
      error?: { message: string };
    };

    if (data.error) {
      return { status: "error", error: data.error.message };
    }

    if (!data.result?.value) {
      return { status: "not_found" };
    }

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const value = data.result.value as { data?: [string, string]; [key: string]: unknown };
    const rawData = value.data?.[0];
    if (!rawData) {
      return { status: "error", error: "Account data missing from RPC response" };
    }

    return { status: "exists", data: rawData };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown RPC error",
    };
  }
}
