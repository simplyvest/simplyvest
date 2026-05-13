use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::token::{self, Transfer};

use crate::errors::TdpError;
use crate::state::{CreateStreamParams, StreamAccount};

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
        space = 8 + StreamAccount::INIT_SPACE,
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

pub fn create_stream_handler(ctx: Context<CreateStream>, params: CreateStreamParams) -> Result<()> { // 1. Validations
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

Ok(()) }
