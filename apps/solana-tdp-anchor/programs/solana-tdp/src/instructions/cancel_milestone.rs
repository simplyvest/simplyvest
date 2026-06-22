use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Transfer};
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::TdpError;
use crate::events::MilestoneCancelled;
use crate::state::MilestoneStreamAccount;

#[derive(Accounts)]
pub struct CancelMilestone<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(
        mut,
        close = sender,
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
    #[account(mut, constraint = sender_token.mint == mint.key() @ TdpError::Unauthorized)]
    pub sender_token: Box<Account<'info, TokenAccount>>,
    #[account(
        constraint = mint.key() == stream.mint @ TdpError::Unauthorized
    )]
    pub mint: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,
}

pub fn cancel_milestone_handler(ctx: Context<CancelMilestone>) -> Result<()> {
    let stream = &mut ctx.accounts.stream;

    require_keys_eq!(
        ctx.accounts.sender.key(),
        stream.creator,
        TdpError::Unauthorized
    );
    require!(!stream.cancelled, TdpError::AlreadyCancelled);
    require!(
        !stream.milestone_reached,
        TdpError::MilestoneAlreadyTriggered
    );

    let return_amount = stream
        .amount
        .checked_sub(stream.amount_withdrawn)
        .ok_or(TdpError::ArithmeticOverflow)?;

    stream.cancelled = true;

    let seeds = &[
        b"milestone-stream",
        stream.creator.as_ref(),
        stream.recipient.as_ref(),
        stream.mint.as_ref(),
        &stream.vesting_count.to_le_bytes(),
        &[stream.bump],
    ];
    let signer = &[&seeds[..]];

    if return_amount > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.sender_token.to_account_info(),
                    authority: stream.to_account_info(),
                },
                signer,
            ),
            return_amount,
        )?;
    }

    emit!(MilestoneCancelled {
        stream: stream.key(),
        creator: ctx.accounts.sender.key(),
        recipient: stream.recipient,
        returned_to_creator: return_amount,
    });

    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.vault.to_account_info(),
            destination: ctx.accounts.sender.to_account_info(),
            authority: stream.to_account_info(),
        },
        signer,
    ))?;

    Ok(())
}
