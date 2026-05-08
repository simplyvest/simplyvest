//! Solana Token Distribution Protocol (TDP)
//!
//! Program ID: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
//!
//! Instructions
//! ─────────────────────────────────────────────────────────────
//!  create_stream  – Lock tokens in a PDA vault; record vesting schedule
//!  withdraw       – Recipient claims all tokens vested so far
//!  cancel         – Sender cancels: vested → recipient, unvested → sender

#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// ─── Program ────────────────────────────────────────────────────────────────

#[program]
pub mod solana_tdp {
    use super::*;

    /// Initialize a vesting stream and deposit tokens into the PDA vault.
    ///
    /// # Accounts
    /// - sender        (Signer, mut)        – pays rent; source of tokens
    /// - recipient     (unchecked)          – beneficiary; stored in StreamAccount
    /// - stream        (init PDA)           – [b"stream", sender, recipient]
    /// - vault         (init PDA TokenAcct) – [b"vault", stream]
    /// - sender_token  (mut TokenAcct)      – debited on creation
    /// - mint          (Mint)               – SPL token being distributed
    /// - token_program, system_program, rent
    pub fn create_stream(
        _ctx: Context<CreateStream>,
        _params: CreateStreamParams,
    ) -> Result<()> {
        Ok(())
    }

    /// Claim all tokens that have vested since the last withdrawal.
    ///
    /// # Accounts
    /// - recipient        (Signer, mut)     – must match stream.recipient
    /// - stream           (mut PDA)         – verified via has_one = recipient
    /// - vault            (mut PDA)         – transfers out of this account
    /// - recipient_token  (mut TokenAcct)   – credited with vested amount
    /// - token_program
    pub fn withdraw(_ctx: Context<Withdraw>) -> Result<()> {
        Ok(())
    }

    /// Cancel the stream early.
    ///
    /// # Accounts
    /// - sender           (Signer, mut)     – must match stream.sender
    /// - recipient        (unchecked)       – seed verification only
    /// - stream           (mut PDA)         – marked cancelled = true
    /// - vault            (mut PDA)         – split between both parties
    /// - sender_token     (mut TokenAcct)   – receives unvested remainder
    /// - recipient_token  (mut TokenAcct)   – receives vested portion
    /// - token_program
    pub fn cancel(_ctx: Context<Cancel>) -> Result<()> {
        Ok(())
    }
}

// ─── Parameters ─────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct CreateStreamParams {
    /// Total tokens to lock (raw units — include decimals).
    pub amount: u64,
    /// Stream start as Unix timestamp (seconds).
    pub start_time: i64,
    /// Stream end / fully-vested as Unix timestamp.
    pub end_time: i64,
    /// Cliff timestamp; recipient cannot withdraw before this (0 = no cliff).
    pub cliff_time: i64,
    /// PDA bump — stored so the program can re-derive the signer later.
    pub stream_bump: u8,
}

// ─── On-chain State ──────────────────────────────────────────────────────────

#[account]
#[derive(Debug)]
pub struct StreamAccount {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub mint: Pubkey,
    pub vault: Pubkey,
    pub amount: u64,
    pub amount_withdrawn: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub cliff_time: i64,
    pub cancelled: bool,
    pub bump: u8,
}

impl StreamAccount {
    pub const LEN: usize =
          8   // Anchor discriminator
        + 32  // sender
        + 32  // recipient
        + 32  // mint
        + 32  // vault
        + 8   // amount
        + 8   // amount_withdrawn
        + 8   // start_time
        + 8   // end_time
        + 8   // cliff_time
        + 1   // cancelled
        + 1;  // bump
}

// ─── Account Contexts ────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(params: CreateStreamParams)]
pub struct CreateStream<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    /// CHECK: recipient is not required to sign at stream creation.
    pub recipient: AccountInfo<'info>,

    #[account(
        init,
        payer = sender,
        space = 8 + 150,
        seeds = [b"stream", sender.key().as_ref(), recipient.key().as_ref()],
        bump,
    )]
    pub stream: Box<Account<'info, StreamAccount>>,

    #[account(
        init,
        payer = sender,
        token::mint = mint,
        token::authority = stream,
        seeds = [b"vault", stream.key().as_ref()],
        bump,
    )]
    pub vault: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub sender_token: Box<Account<'info, TokenAccount>>,

    pub mint: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub recipient: Signer<'info>,

    #[account(
        mut,
        seeds = [b"stream", stream.sender.as_ref(), recipient.key().as_ref()],
        bump = stream.bump,
        has_one = recipient,
    )]
    pub stream: Box<Account<'info, StreamAccount>>,

    #[account(
        mut,
        seeds = [b"vault", stream.key().as_ref()],
        bump,
    )]
    pub vault: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub recipient_token: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    /// CHECK: used only for PDA seed verification.
    pub recipient: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"stream", sender.key().as_ref(), recipient.key().as_ref()],
        bump = stream.bump,
        has_one = sender,
    )]
    pub stream: Box<Account<'info, StreamAccount>>,

    #[account(
        mut,
        seeds = [b"vault", stream.key().as_ref()],
        bump,
    )]
    pub vault: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub sender_token: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub recipient_token: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

// ─── Custom Errors ───────────────────────────────────────────────────────────

#[error_code]
pub enum TdpError {
    #[msg("Stream has already been cancelled.")]
    AlreadyCancelled,
    #[msg("Stream has not started yet.")]
    StreamNotStarted,
    #[msg("No tokens are available to withdraw at this time.")]
    NothingToWithdraw,
    #[msg("start_time must be before end_time.")]
    InvalidTimeRange,
    #[msg("cliff_time must be between start_time and end_time.")]
    InvalidCliffTime,
    #[msg("Amount must be greater than zero.")]
    InvalidAmount,
}
