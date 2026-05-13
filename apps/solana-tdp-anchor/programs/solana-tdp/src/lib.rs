//! Solana Token Distribution Protocol (TDP)
//! Program ID: 6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk

#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk");

#[program]
pub mod solana_tdp {
    use super::*;

    pub fn create_stream(ctx: Context<CreateStream>, params: CreateStreamParams) -> Result<()> {
        // 1. Validations
        require!(params.amount > 0, TdpError::InvalidAmount);
        require!(
            params.start_time < params.end_time,
            TdpError::InvalidTimeRange
        );

        if params.cliff_time != 0 {
            require!(
                params.cliff_time >= params.start_time && params.cliff_time <= params.end_time,
                TdpError::InvalidCliffTime
            );
        }

        // 2. Transfer tokens to Vault PDA
        let cpi_accounts = Transfer {
            from: ctx.accounts.sender_token.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.sender.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), params.amount)?;

        // 3. Initialize State
        let stream = &mut ctx.accounts.stream;
        stream.sender = ctx.accounts.sender.key();
        stream.recipient = ctx.accounts.recipient.key();
        stream.mint = ctx.accounts.mint.key();
        stream.vault = ctx.accounts.vault.key();
        stream.amount = params.amount;
        stream.amount_withdrawn = 0;
        stream.start_time = params.start_time;
        stream.end_time = params.end_time;
        stream.cliff_time = params.cliff_time;
        stream.cancelled = false;
        stream.bump = ctx.bumps.stream;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        let now = Clock::get()?.unix_timestamp;

        require!(!stream.cancelled, TdpError::AlreadyCancelled);
        require!(now >= stream.cliff_time, TdpError::CliffNotReached);

        // 1. Calculate Linear Vesting
        let total_vested = if now >= stream.end_time {
            stream.amount
        } else if now <= stream.start_time {
            0
        } else {
            let elapsed = (now - stream.start_time) as u64;
            let duration = (stream.end_time - stream.start_time) as u64;
            stream
                .amount
                .checked_mul(elapsed)
                .unwrap()
                .checked_div(duration)
                .unwrap()
        };

        // 2. Determine claimable amount
        let claimable = total_vested.checked_sub(stream.amount_withdrawn).unwrap();
        require!(claimable > 0, TdpError::NothingToWithdraw);

        // 3. Update state
        stream.amount_withdrawn = stream.amount_withdrawn.checked_add(claimable).unwrap();

        // 4. CPI Transfer (Signed by Stream PDA)
        let seeds = &[
            b"stream",
            stream.sender.as_ref(),
            stream.recipient.as_ref(),
            &[stream.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.recipient_token.to_account_info(),
            authority: stream.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(
            CpiContext::new_with_signer(cpi_program, cpi_accounts, signer),
            claimable,
        )?;

        Ok(())
    }

    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        let now = Clock::get()?.unix_timestamp;

        require!(!stream.cancelled, TdpError::AlreadyCancelled);

        // Calculate split at moment of cancellation
        let vested_at_cancel = if now >= stream.end_time {
            stream.amount
        } else if now <= stream.start_time {
            0
        } else {
            let elapsed = (now - stream.start_time) as u64;
            let duration = (stream.end_time - stream.start_time) as u64;
            stream
                .amount
                .checked_mul(elapsed)
                .unwrap()
                .checked_div(duration)
                .unwrap()
        };

        let recipient_share = vested_at_cancel
            .checked_sub(stream.amount_withdrawn)
            .unwrap();
        let sender_share = stream.amount.checked_sub(vested_at_cancel).unwrap();

        let seeds = &[
            b"stream",
            stream.sender.as_ref(),
            stream.recipient.as_ref(),
            &[stream.bump],
        ];
        let signer = &[&seeds[..]];
        let cpi_program = ctx.accounts.token_program.to_account_info();

        // Payout recipient what they earned so far
        if recipient_share > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    cpi_program.clone(),
                    Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.recipient_token.to_account_info(),
                        authority: stream.to_account_info(),
                    },
                    signer,
                ),
                recipient_share,
            )?;
        }

        // Return the rest to sender
        if sender_share > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    cpi_program,
                    Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.sender_token.to_account_info(),
                        authority: stream.to_account_info(),
                    },
                    signer,
                ),
                sender_share,
            )?;
        }

        stream.cancelled = true;
        stream.amount_withdrawn = stream.amount; // Effectively closes the stream

        Ok(())
    }
}

// ─── Data Structures ─────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct CreateStreamParams {
    pub amount: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub cliff_time: i64,
}

#[account]
#[derive(Default, Debug)]
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
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 1;
}

// ─── Validation Contexts ──────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(params: CreateStreamParams)]
pub struct CreateStream<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: Recipient doesn't sign
    pub recipient: AccountInfo<'info>,
    #[account(
        init,
        payer = sender,
        space = StreamAccount::LEN,
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
    /// CHECK: Seed verification only
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

#[error_code]
pub enum TdpError {
    #[msg("Stream has already been cancelled.")]
    AlreadyCancelled,
    #[msg("Cliff time has not been reached yet.")]
    CliffNotReached,
    #[msg("No tokens are available to withdraw at this time.")]
    NothingToWithdraw,
    #[msg("start_time must be before end_time.")]
    InvalidTimeRange,
    #[msg("cliff_time must be between start_time and end_time.")]
    InvalidCliffTime,
    #[msg("Amount must be greater than zero.")]
    InvalidAmount,
}
