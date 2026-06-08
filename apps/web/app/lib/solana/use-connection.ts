import type { Connection } from "@solana/web3.js";
import { useContext } from "react";

import { ConnectionContext } from "./connection-context";

export function useConnection(): { connection: Connection } {
  const connection = useContext(ConnectionContext);
  return { connection };
}
