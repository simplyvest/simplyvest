use anchor_lang::prelude::*;

#[error_code]
pub enum TdpError {
    #[msg("Stream has already been cancelled.")]
    AlreadyCancelled,
    #[msg("Cliff time has not been reached yet.")]
    CliffNotReached,
    #[msg("No tokens are available to withdraw at this time.")]
    NothingToWithdraw,
    #[msg("start_time must be before end_time.")]
    InvalidTimeRange,
    #[msg("cliff_time must be between start_time and end_time.")]
    InvalidCliffTime,
    #[msg("Amount must be greater than zero.")]
    InvalidAmount,
}
