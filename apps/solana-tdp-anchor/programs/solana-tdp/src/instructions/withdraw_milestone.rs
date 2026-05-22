use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, CloseAccount, Transfer};
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::TdpError;
use crate::events::MilestoneCompleted;
use crate::state::MilestoneStreamAccount;

#[derive(Accounts)]
pub struct WithdrawMilestone<'info> {
    #[account(
        mut,
        constraint = recipient.key() == stream.recipient @ TdpError::Unauthorized
    )]
    pub recipient: Signer<'info>,
    #[account(
        mut,
        seeds = [b"milestone-stream", stream.creator.as_ref(), stream.recipient.as_ref(), stream.mint.as_ref(), &stream.vesting_count.to_le_bytes()],
        bump = stream.bump,
    )]
    pub stream: Box<Account<'info, MilestoneStreamAccount>>,
    #[account(
        mut,
        seeds = [b"vault", stream.key().as_ref()],
        bump,
    )]
    pub vault: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = recipient,
        associated_token::mint = mint,
        associated_token::authority = recipient,
    )]
    pub recipient_token: Box<Account<'info, TokenAccount>>,
    /// CHECK: Used only for rent return on closure
    #[account(mut)]
    pub sender: AccountInfo<'info>,
    #[account(
        constraint = mint.key() == stream.mint @ TdpError::Unauthorized
    )]
    pub mint: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn withdraw_milestone_handler(ctx: Context<WithdrawMilestone>) -> Result<()> {
    let stream = &mut ctx.accounts.stream;

    require!(!stream.cancelled, TdpError::AlreadyCancelled);
    require!(stream.milestone_reached, TdpError::NothingToWithdraw);
    require!(stream.amount_withdrawn == 0, TdpError::FullyVested);

    let payout = stream.amount;
    let creator = stream.creator;
    let recipient = stream.recipient;
    let mint = stream.mint;
    let vesting_count = stream.vesting_count;
    let bump = stream.bump;

    stream.amount_withdrawn = payout;

    let seeds = &[
        b"milestone-stream",
        creator.as_ref(),
        recipient.as_ref(),
        mint.as_ref(),
        &vesting_count.to_le_bytes(),
        &[bump],
    ];
    let signer = &[&seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.recipient_token.to_account_info(),
                authority: stream.to_account_info(),
            },
            signer,
        ),
        payout,
    )?;

    emit!(MilestoneCompleted {
        stream: stream.key(),
        recipient: ctx.accounts.recipient.key(),
        amount: payout,
    });

    require_keys_eq!(ctx.accounts.sender.key(), creator, TdpError::Unauthorized);

    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.vault.to_account_info(),
            destination: ctx.accounts.sender.to_account_info(),
            authority: stream.to_account_info(),
        },
        signer,
    ))?;

    let stream_info = stream.to_account_info();
    let lamports = stream_info.lamports();
    **ctx
        .accounts
        .sender
        .to_account_info()
        .try_borrow_mut_lamports()? += lamports;
    **stream_info.try_borrow_mut_lamports()? = 0;
    stream_info.data.borrow_mut().fill(0);

    Ok(())
}
