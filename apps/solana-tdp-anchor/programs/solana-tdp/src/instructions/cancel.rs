use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};
use anchor_spl::token::{self, Transfer};

use crate::errors::TdpError;
use crate::state::StreamAccount;

#[derive(Accounts)]
pub struct Cancel<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: Seed verification only
    pub recipient: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [b"stream", sender.key().as_ref(), recipient.key().as_ref(), stream.mint.as_ref(), &stream.vesting_count.to_le_bytes()],
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

pub fn cancel_handler(ctx: Context<Cancel>) -> Result<()> { let stream = &mut ctx.accounts.stream;
let now = Clock::get()?.unix_timestamp;

require!(!stream.cancelled, TdpError::StreamNotActive);

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
    stream.mint.as_ref(),
    &stream.vesting_count.to_le_bytes(),
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

Ok(()) }
