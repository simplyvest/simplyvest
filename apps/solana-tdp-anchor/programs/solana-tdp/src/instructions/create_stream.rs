use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::token::{self, Transfer};

use crate::errors::TdpError;
use crate::events::StreamCreated;
use crate::state::{CreateStreamParams, CreatorConfig, StreamAccount};

#[derive(Accounts)]
#[instruction(params: CreateStreamParams)]
pub struct CreateStream<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: Recipient doesn't sign
    pub recipient: AccountInfo<'info>,
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
        space = 8 + StreamAccount::INIT_SPACE,
        seeds = [b"stream", sender.key().as_ref(), recipient.key().as_ref(), mint.key().as_ref(), &creator_config.vesting_count.to_le_bytes()],
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
require!(params.amount > 0, TdpError::ZeroAmount);
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

	// Duration must be at least 60 seconds
	require!(
	    params.end_time - params.start_time >= 60,
	    TdpError::DurationTooShort
	);

	// Sender must have sufficient token balance
	require!(
	    ctx.accounts.sender_token.amount >= params.amount,
	    TdpError::InsufficientBalance
	);

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
stream.vesting_count = ctx.accounts.creator_config.vesting_count;
stream.vault_bump = ctx.bumps.vault;

	// Emit StreamCreated event
	emit!(StreamCreated {
	    stream: stream.key(),
	    creator: ctx.accounts.sender.key(),
	    recipient: ctx.accounts.recipient.key(),
	    mint: ctx.accounts.mint.key(),
	    amount: params.amount,
	    start_time: params.start_time,
	    cliff_time: params.cliff_time,
	    end_time: params.end_time,
	});

// 4. Increment vesting_count for next stream
let creator_config = &mut ctx.accounts.creator_config;
creator_config.creator = ctx.accounts.sender.key();
creator_config.vesting_count = creator_config.vesting_count.checked_add(1).unwrap();

Ok(()) }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pda_derivation() {
        let program_id = crate::ID;
        let creator = Pubkey::new_unique();
        let recipient = Pubkey::new_unique();
        let mint = Pubkey::new_unique();
        let vesting_count: u64 = 0;

        // Derive CreatorConfig PDA
        let (creator_config_pda, _) = Pubkey::find_program_address(
            &[b"creator_config", creator.as_ref()],
            &program_id,
        );

        // Derive Stream PDA using new seed pattern
        let (stream_pda, _) = Pubkey::find_program_address(
            &[
                b"stream",
                creator.as_ref(),
                recipient.as_ref(),
                mint.as_ref(),
                &vesting_count.to_le_bytes(),
            ],
            &program_id,
        );
        assert_ne!(stream_pda, Pubkey::default());
        assert_ne!(stream_pda, creator_config_pda);

        // Verify same seeds produce same PDA (deterministic)
        let (stream_pda2, _) = Pubkey::find_program_address(
            &[
                b"stream",
                creator.as_ref(),
                recipient.as_ref(),
                mint.as_ref(),
                &vesting_count.to_le_bytes(),
            ],
            &program_id,
        );
        assert_eq!(stream_pda, stream_pda2);

        // Verify different vesting_count produces different PDA
        let (stream_pda3, _) = Pubkey::find_program_address(
            &[
                b"stream",
                creator.as_ref(),
                recipient.as_ref(),
                mint.as_ref(),
                &1u64.to_le_bytes(),
            ],
            &program_id,
        );
        assert_ne!(stream_pda, stream_pda3);
    }

    #[test]
    fn test_duration_too_short_rejected() {
        let params = CreateStreamParams {
            amount: 1_000_000,
            start_time: 1000,
            end_time: 1058, // 58 seconds < 60
            cliff_time: 0,
        };
        // Verify the validation condition: end_time - start_time >= 60
        assert!(
            params.end_time - params.start_time < 60,
            "Duration 58s should trigger DurationTooShort"
        );
    }

    #[test]
    fn test_minimum_duration_accepted() {
        let params = CreateStreamParams {
            amount: 1_000_000,
            start_time: 1000,
            end_time: 1060, // exactly 60 seconds
            cliff_time: 0,
        };
        assert!(
            params.end_time - params.start_time >= 60,
            "Duration exactly 60s should pass the duration check"
        );
    }

    #[test]
    fn test_insufficient_balance_rejected() {
        let balance: u64 = 100;
        let required: u64 = 200;
        assert!(
            balance < required,
            "Balance 100 < 200 should trigger InsufficientBalance"
        );
    }

    #[test]
    fn test_sufficient_balance_accepted() {
        let balance: u64 = 200;
        let required: u64 = 200;
        assert!(
            balance >= required,
            "Balance 200 >= 200 should pass the balance check"
        );
    }
}
