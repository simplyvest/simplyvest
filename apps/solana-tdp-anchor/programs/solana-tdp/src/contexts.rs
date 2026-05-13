use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

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
