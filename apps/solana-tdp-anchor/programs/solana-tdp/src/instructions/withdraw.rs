use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};
use anchor_spl::token::{self, Transfer};

use crate::errors::TdpError;
use crate::state::StreamAccount;

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

pub fn withdraw_handler(ctx: Context<Withdraw>) -> Result<()> { let stream = &mut ctx.accounts.stream;
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

Ok(()) }
