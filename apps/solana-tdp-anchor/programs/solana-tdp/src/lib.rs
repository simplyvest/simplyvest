//! Solana Token Distribution Protocol (TDP)
//! Program ID: 6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk

#![allow(unexpected_cfgs)]

pub mod state;
pub mod errors;
pub mod events;
pub mod instructions;

pub use state::*;
pub use errors::*;
pub use events::*;
pub use instructions::*;

use anchor_lang::prelude::*;

declare_id!("6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk");

#[program]
pub mod solana_tdp {
    use super::*;

    pub fn create_stream(ctx: Context<CreateStream>, params: CreateStreamParams) -> Result<()> {
        instructions::create_stream::create_stream_handler(ctx, params)
    }

    pub fn withdraw(ctx: Context<Withdraw>, params: WithdrawParams) -> Result<()> {
        instructions::withdraw::withdraw_handler(ctx, params)
    }
    
    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        instructions::cancel::cancel_handler(ctx)
    }

    pub fn create_milestone_stream(ctx: Context<CreateMilestoneStream>, params: CreateMilestoneStreamParams) -> Result<()> {
        instructions::create_milestone_stream::create_milestone_stream_handler(ctx, params)
    }

    pub fn trigger_milestone(ctx: Context<TriggerMilestone>) -> Result<()> {
        instructions::trigger_milestone::trigger_milestone_handler(ctx)
    }

    pub fn withdraw_milestone(ctx: Context<WithdrawMilestone>) -> Result<()> {
        instructions::withdraw_milestone::withdraw_milestone_handler(ctx)
    }

    pub fn cancel_milestone(ctx: Context<CancelMilestone>) -> Result<()> {
        instructions::cancel_milestone::cancel_milestone_handler(ctx)
    }
}
