use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::TdpError;
use crate::events::MilestoneStreamCreated;
use crate::state::{CreateMilestoneStreamParams, CreatorConfig, MilestoneStreamAccount};

#[derive(Accounts)]
pub struct CreateMilestoneStream<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: Recipient doesn't sign
    pub recipient: AccountInfo<'info>,
    /// CHECK: Milestone authority doesn't sign at creation
    pub milestone_authority: AccountInfo<'info>,
    #[account(
        init_if_needed,
        payer = sender,
        space = 8 + CreatorConfig::INIT_SPACE,
        seeds = [b"creator_config", sender.key().as_ref()],
        bump,
    )]
    pub creator_config: Box<Account<'info, CreatorConfig>>,
    #[account(
        init,
        payer = sender,
        space = 8 + MilestoneStreamAccount::INIT_SPACE,
        seeds = [b"milestone-stream", sender.key().as_ref(), recipient.key().as_ref(), mint.key().as_ref(), &creator_config.vesting_count.to_le_bytes()],
        bump,
    )]
    pub stream: Box<Account<'info, MilestoneStreamAccount>>,
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

pub fn create_milestone_stream_handler(ctx: Context<CreateMilestoneStream>, params: CreateMilestoneStreamParams) -> Result<()> {
    require!(params.amount > 0, TdpError::ZeroAmount);
    require!(
        ctx.accounts.sender_token.amount >= params.amount,
        TdpError::InsufficientBalance
    );

    let cpi_accounts = Transfer {
        from: ctx.accounts.sender_token.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.sender.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    token::transfer(CpiContext::new(cpi_program, cpi_accounts), params.amount)?;

    let stream = &mut ctx.accounts.stream;
    stream.creator = ctx.accounts.sender.key();
    stream.recipient = ctx.accounts.recipient.key();
    stream.mint = ctx.accounts.mint.key();
    stream.vault = ctx.accounts.vault.key();
    stream.amount = params.amount;
    stream.amount_withdrawn = 0;
    stream.milestone_authority = ctx.accounts.milestone_authority.key();
    stream.milestone_reached = false;
    stream.cancelled = false;
    stream.bump = ctx.bumps.stream;
    stream.vesting_count = ctx.accounts.creator_config.vesting_count;
    stream.vault_bump = ctx.bumps.vault;

    emit!(MilestoneStreamCreated {
        stream: stream.key(),
        creator: ctx.accounts.sender.key(),
        recipient: ctx.accounts.recipient.key(),
        mint: ctx.accounts.mint.key(),
        amount: params.amount,
        milestone_authority: ctx.accounts.milestone_authority.key(),
    });

    let creator_config = &mut ctx.accounts.creator_config;
    creator_config.creator = ctx.accounts.sender.key();
    creator_config.vesting_count = creator_config.vesting_count.checked_add(1).unwrap();

    Ok(())
}
