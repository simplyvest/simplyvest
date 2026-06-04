use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::Mint;
use anchor_spl::token::{self, CloseAccount, Transfer};
use anchor_spl::token::{Token, TokenAccount};

use crate::errors::TdpError;
use crate::events::{StreamCompleted, TokensClaimed};
use crate::state::StreamAccount;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct WithdrawParams {
    pub amount: u64,
}

#[derive(Accounts)]
#[instruction(params: WithdrawParams)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub recipient: Signer<'info>,

    #[account(
        mut,
        seeds = [b"stream", stream.creator.as_ref(), recipient.key().as_ref(), stream.mint.as_ref(), &stream.vesting_count.to_le_bytes()],
        bump = stream.bump,
    )]
    pub stream: Box<Account<'info, StreamAccount>>,

    #[account(
        mut,
        seeds = [b"vault", stream.key().as_ref()],
        bump,
    )]
    pub vault: Box<Account<'info, TokenAccount>>,

    // Create recipient's ATA if it doesn't exist yet
    #[account(
        init_if_needed,
        payer = recipient,
        associated_token::mint = mint,
        associated_token::authority = recipient,
    )]
    pub recipient_token: Box<Account<'info, TokenAccount>>,

    /// CHECK: Used only for rent return on closure. Verified via stream.creator.
    #[account(mut)]
    pub sender: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    /// The mint for the stream. Must match stream.mint.
    #[account(
        constraint = mint.key() == stream.mint @ TdpError::Unauthorized
    )]
    pub mint: Box<Account<'info, Mint>>,
}

pub fn withdraw_handler(ctx: Context<Withdraw>, params: WithdrawParams) -> Result<()> {
    let stream = &mut ctx.accounts.stream;
    let now = Clock::get()?.unix_timestamp;

    // 1. Validations
    require!(!stream.cancelled, TdpError::AlreadyCancelled);
    require!(now >= stream.cliff_time, TdpError::CliffNotReached);
    require!(params.amount > 0, TdpError::ZeroAmount);

    // 2. Calculate linear vesting from start_time to end_time (locked until cliff_time)
    let total_vested = if now >= stream.end_time {
        stream.amount
    } else if now < stream.cliff_time {
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

    // 3. Determine claimable amount
    let claimable = total_vested.checked_sub(stream.amount_withdrawn).unwrap();
    require!(claimable > 0, TdpError::NothingToWithdraw);
    require!(params.amount <= claimable, TdpError::ExceedsClaimable);

    // 4. Update state
    stream.amount_withdrawn = stream.amount_withdrawn.checked_add(params.amount).unwrap();

    // 5. CPI Transfer (Signed by Stream PDA)
    let seeds = &[
        b"stream",
        stream.creator.as_ref(),
        stream.recipient.as_ref(),
        stream.mint.as_ref(),
        &stream.vesting_count.to_le_bytes(),
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
        params.amount,
    )?;

    // 6. Emit TokensClaimed
    emit!(TokensClaimed {
        stream: stream.key(),
        recipient: ctx.accounts.recipient.key(),
        amount: stream.amount,
        claimed: params.amount,
        total_claimed: stream.amount_withdrawn,
    });

    // 7. If fully withdrawn, close vault and stream
    if stream.amount_withdrawn == stream.amount {
        require_keys_eq!(
            ctx.accounts.sender.key(),
            stream.creator,
            TdpError::Unauthorized
        );

        // Close vault token account — rent to sender
        token::close_account(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.vault.to_account_info(),
                destination: ctx.accounts.sender.to_account_info(),
                authority: stream.to_account_info(),
            },
            signer,
        ))?;

        // Close stream account — zero data and transfer rent to sender
        let total_amount = stream.amount;
        let stream_info = stream.to_account_info();
        let lamports = stream_info.lamports();
        **ctx
            .accounts
            .sender
            .to_account_info()
            .try_borrow_mut_lamports()? += lamports;
        **stream_info.try_borrow_mut_lamports()? = 0;
        stream_info.data.borrow_mut().fill(0);

        // Emit StreamCompleted
        emit!(StreamCompleted {
            stream: stream.key(),
            recipient: ctx.accounts.recipient.key(),
            total_amount,
        });
    }

    Ok(())
}
