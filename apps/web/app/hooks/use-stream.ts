function notNull<T>(x: T | null | undefined): x is T {
  return x != null;
}
import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { utils } from "@coral-xyz/anchor";

import { useProgram } from "./use-program";

const STREAM_DISCRIMINATOR = [243, 60, 164, 106, 199, 192, 110, 53];
const MILESTONE_DISCRIMINATOR = [32, 129, 16, 253, 73, 199, 39, 42];

export function useStream(pda: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["stream", pda?.toBase58()],
    queryFn: () => {
      if (!pda) throw new Error("Stream PDA is required");
      return program.account.streamAccount.fetch(pda);
    },
    enabled: !!pda,
  });
}

export function useStreams(sender?: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["streams", sender?.toBase58()],
    queryFn: async () => {
      const { connection } = program.provider;

      const rawAccounts = await connection.getProgramAccounts(
        program.programId,
        {
          commitment: "confirmed",
          filters: [
            {
              memcmp: {
                offset: 0,
                bytes: utils.bytes.bs58.encode(
                  Buffer.from(STREAM_DISCRIMINATOR),
                ),
              },
            },
            { dataSize: 187 },
          ],
        },
      );

      const streams = rawAccounts
        .map(({ pubkey, account }) => {
          try {
            const decoded = program.coder.accounts.decode(
              "StreamAccount",
              Buffer.from(account.data),
            );
            return { publicKey: pubkey, account: decoded };
          } catch (e) {
            console.warn("[useStreams] Skipping unparseable account:", pubkey.toBase58(), e);
            return null;
          }
        })
        .filter(notNull);

      if (sender) {
        return streams.filter((s) => s!.account.sender.equals(sender));
      }
      return streams;
    },
    enabled: true,
    retry: 1,
  });
}

export function useMilestoneStreams(creator?: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["milestoneStreams", creator?.toBase58()],
    queryFn: async () => {
      const { connection } = program.provider;

      const rawAccounts = await connection.getProgramAccounts(
        program.programId,
        {
          commitment: "confirmed",
          filters: [
            {
              memcmp: {
                offset: 0,
                bytes: utils.bytes.bs58.encode(
                  Buffer.from(MILESTONE_DISCRIMINATOR),
                ),
              },
            },
            { dataSize: 196 },
          ],
        },
      );

      const streams = rawAccounts
        .map(({ pubkey, account }) => {
          try {
            const decoded = program.coder.accounts.decode(
              "MilestoneStreamAccount",
              Buffer.from(account.data),
            );
            return { publicKey: pubkey, account: decoded };
          } catch (e) {
            console.warn("[useMilestoneStreams] Skipping unparseable account:", pubkey.toBase58(), e);
            return null;
          }
        })
        .filter(notNull);

      if (creator) {
        return streams.filter((s) => s!.account.creator.equals(creator));
      }
      return streams;
    },
    enabled: true,
    retry: 1,
  });
}

export function useMilestoneStream(pda: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["milestoneStream", pda?.toBase58()],
    queryFn: () => {
      if (!pda) throw new Error("MilestoneStream PDA is required");
      return program.account.milestoneStreamAccount.fetch(pda);
    },
    enabled: !!pda,
  });
}

export function useCreatorConfig(creator: PublicKey | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["creatorConfig", creator?.toBase58()],
    queryFn: () => {
      if (!creator) throw new Error("Creator public key is required");
      return program.account.creatorConfig.fetchNullable(creator);
    },
    enabled: !!creator,
  });
}
