use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};

use crate::contexts::{Cancel, CreateStream, Withdraw};
use crate::errors::TdpError;
use crate::state::CreateStreamParams;

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
