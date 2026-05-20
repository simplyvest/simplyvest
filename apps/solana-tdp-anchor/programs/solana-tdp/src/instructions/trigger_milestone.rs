use anchor_lang::prelude::*;

use crate::errors::TdpError;
use crate::events::MilestoneTriggered;
use crate::state::MilestoneStreamAccount;

#[derive(Accounts)]
pub struct TriggerMilestone<'info> {
    pub milestone_authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"milestone-stream", stream.creator.as_ref(), stream.recipient.as_ref(), stream.mint.as_ref(), &stream.vesting_count.to_le_bytes()],
        bump = stream.bump,
    )]
    pub stream: Box<Account<'info, MilestoneStreamAccount>>,
}

pub fn trigger_milestone_handler(ctx: Context<TriggerMilestone>) -> Result<()> {
    let stream = &mut ctx.accounts.stream;

    require_keys_eq!(
        ctx.accounts.milestone_authority.key(),
        stream.milestone_authority,
        TdpError::Unauthorized
    );
    require!(!stream.cancelled, TdpError::AlreadyCancelled);
    require!(!stream.milestone_reached, TdpError::FullyVested);

    stream.milestone_reached = true;

    emit!(MilestoneTriggered {
        stream: stream.key(),
        milestone_authority: ctx.accounts.milestone_authority.key(),
    });

    Ok(())
}
