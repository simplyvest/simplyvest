import { useContext } from "react";
import type { Connection } from "@solana/web3.js";

import { ConnectionContext } from "./connection-context";

export function useConnection(): { connection: Connection } {
  const connection = useContext(ConnectionContext);
  return { connection };
}
