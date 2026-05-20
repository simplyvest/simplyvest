use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::token::{self, CloseAccount, Transfer};

use crate::errors::TdpError;
use crate::events::StreamCancelled;
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
    )]
    pub stream: Box<Account<'info, StreamAccount>>,

    #[account(
        mut,
        seeds = [b"vault", stream.key().as_ref()],
        bump,
    )]
    pub vault: Box<Account<'info, TokenAccount>>,

    /// Creator's token account to receive returned unvested tokens.
    /// Must exist (creator funded the stream from this or another account for the same mint).
    #[account(mut)]
    pub sender_token: Box<Account<'info, TokenAccount>>,

    /// Recipient's ATA — created if missing (payer = sender/creator).
    #[account(
        init_if_needed,
        payer = sender,
        associated_token::mint = mint,
        associated_token::authority = recipient,
    )]
    pub recipient_token: Box<Account<'info, TokenAccount>>,

    /// The mint for the stream. Must match stream.mint.
    #[account(
        constraint = mint.key() == stream.mint @ TdpError::Unauthorized
    )]
    pub mint: Box<Account<'info, Mint>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn cancel_handler(ctx: Context<Cancel>) -> Result<()> {
    let stream = &mut ctx.accounts.stream;
    let now = Clock::get()?.unix_timestamp;

    require!(!stream.cancelled, TdpError::StreamNotActive);

    // Calculate split at moment of cancellation (cliff-aware: vesting starts at cliff_time)
    let vest_start = if stream.cliff_time != 0 { stream.cliff_time } else { stream.start_time };
    let vested_at_cancel = if now >= stream.end_time {
        stream.amount
    } else if now <= vest_start {
        0
    } else {
        let elapsed = (now - vest_start) as u64;
        let duration = (stream.end_time - vest_start) as u64;
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

    // Mark cancelled early so seeds can borrow stream fields immutably
    stream.cancelled = true;
    stream.amount_withdrawn = stream.amount;

    // Copy seed fields to local vars to avoid overlapping borrows
    let sender = stream.sender;
    let recipient = stream.recipient;
    let mint = stream.mint;
    let vesting_count = stream.vesting_count;
    let bump = stream.bump;

    let seeds = &[
        b"stream",
        sender.as_ref(),
        recipient.as_ref(),
        mint.as_ref(),
        &vesting_count.to_le_bytes(),
        &[bump],
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
                cpi_program.clone(),
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


    // Emit StreamCancelled
    emit!(StreamCancelled {
        stream: stream.key(),
        creator: ctx.accounts.sender.key(),
        recipient: ctx.accounts.recipient.key(),
        vested_to_recipient: recipient_share,
        returned_to_creator: sender_share,
    });

    // Close vault token account — rent to sender
    token::close_account(CpiContext::new_with_signer(
        cpi_program,
        CloseAccount {
            account: ctx.accounts.vault.to_account_info(),
            destination: ctx.accounts.sender.to_account_info(),
            authority: stream.to_account_info(),
        },
        signer,
    ))?;

    // Close stream account — zero data and transfer rent to sender
    let stream_info = stream.to_account_info();
    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(stream_info.data_len());
    **ctx.accounts.sender.to_account_info().try_borrow_mut_lamports()? += rent_lamports;
    **stream_info.try_borrow_mut_lamports()? -= rent_lamports;
    stream_info.data.borrow_mut().fill(0);

    Ok(())
}
