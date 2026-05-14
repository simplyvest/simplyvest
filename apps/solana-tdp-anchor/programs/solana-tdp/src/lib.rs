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

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        instructions::withdraw::withdraw_handler(ctx)
    }

    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        instructions::cancel::cancel_handler(ctx)
    }
}
