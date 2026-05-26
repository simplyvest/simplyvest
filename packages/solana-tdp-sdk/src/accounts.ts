import { web3 } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export const getCreateStreamAccounts = (
  sender: PublicKey,
  recipient: PublicKey,
  mint: PublicKey,
  stream: PublicKey,
  vault: PublicKey,
  senderToken: PublicKey,
  creatorConfig: PublicKey,
) => ({
  sender,
  recipient,
  mint,
  stream,
  vault,
  senderToken,
  creatorConfig,
  tokenProgram: TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
  rent: web3.SYSVAR_RENT_PUBKEY,
});

export const getWithdrawAccounts = (
  recipient: PublicKey,
  stream: PublicKey,
  vault: PublicKey,
  recipientToken: PublicKey,
  sender: PublicKey,
  mint: PublicKey,
) => ({
  recipient,
  stream,
  vault,
  recipientToken,
  sender,
  mint,
  tokenProgram: TOKEN_PROGRAM_ID,
  associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
});

export const getCancelAccounts = (
  sender: PublicKey,
  recipient: PublicKey,
  stream: PublicKey,
  vault: PublicKey,
  senderToken: PublicKey,
  recipientToken: PublicKey,
  mint: PublicKey,
) => ({
  sender,
  recipient,
  stream,
  vault,
  senderToken,
  recipientToken,
  mint,
  tokenProgram: TOKEN_PROGRAM_ID,
  associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
});

export const getCreateMilestoneStreamAccounts = (
  sender: PublicKey,
  recipient: PublicKey,
  milestoneAuthority: PublicKey,
  creatorConfig: PublicKey,
  stream: PublicKey,
  vault: PublicKey,
  senderToken: PublicKey,
  mint: PublicKey,
) => ({
  sender,
  recipient,
  milestoneAuthority,
  creatorConfig,
  stream,
  vault,
  senderToken,
  mint,
  tokenProgram: TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
  rent: web3.SYSVAR_RENT_PUBKEY,
});

export const getTriggerMilestoneAccounts = (milestoneAuthority: PublicKey, stream: PublicKey) => ({
  milestoneAuthority,
  stream,
});

export const getWithdrawMilestoneAccounts = (
  recipient: PublicKey,
  stream: PublicKey,
  vault: PublicKey,
  recipientToken: PublicKey,
  sender: PublicKey,
  mint: PublicKey,
) => ({
  recipient,
  stream,
  vault,
  recipientToken,
  sender,
  mint,
  tokenProgram: TOKEN_PROGRAM_ID,
  associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
});

export const getCancelMilestoneAccounts = (
  sender: PublicKey,
  stream: PublicKey,
  vault: PublicKey,
  senderToken: PublicKey,
  mint: PublicKey,
) => ({
  sender,
  stream,
  vault,
  senderToken,
  mint,
  tokenProgram: TOKEN_PROGRAM_ID,
  associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
});
