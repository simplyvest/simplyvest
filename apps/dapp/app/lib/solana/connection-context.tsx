import { clusterApiUrl, Connection } from "@solana/web3.js";
import { createContext } from "react";

const endpoint = import.meta.env.VITE_SOLANA_RPC_URL ?? clusterApiUrl("devnet");
export const connection = new Connection(endpoint, "confirmed");
export const ConnectionContext = createContext<Connection>(connection);
