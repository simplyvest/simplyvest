use anchor_lang::prelude::*;

#[error_code]
pub enum TdpError {
    #[msg("Amount must be greater than zero.")]
    ZeroAmount,
    #[msg("start_time must be before end_time.")]
    InvalidTimeRange,
    #[msg("cliff_time must be between start_time and end_time.")]
    InvalidCliffTime,
    #[msg("Stream duration must be at least 60 seconds.")]
    DurationTooShort,
    #[msg("Sender does not have enough token balance.")]
    InsufficientBalance,
    #[msg("Unsupported token program. Only SPL Token is supported.")]
    UnsupportedTokenProgram,
    #[msg("Token mint has a transfer hook; not supported.")]
    TokenHasTransferHook,
    #[msg("Cliff time has not been reached yet.")]
    CliffNotReached,
    #[msg("No tokens are available to withdraw at this time.")]
    NothingToWithdraw,
    #[msg("Stream is already cancelled.")]
    AlreadyCancelled,
    #[msg("Stream is fully vested; no tokens remain to cancel.")]
    FullyVested,
    #[msg("Stream start time must be in the future.")]
    StartTimeInPast,
    #[msg("Stream duration has ended; no cancel allowed.")]
    StreamExpired,
    #[msg("Requested amount exceeds claimable tokens.")]
    ExceedsClaimable,
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("Milestone has already been triggered.")]
    MilestoneAlreadyTriggered,
    #[msg("Tokens have already been withdrawn from this milestone.")]
    AlreadyWithdrawn,
    #[msg("Arithmetic overflow in vesting calculation.")]
    ArithmeticOverflow,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_discriminants() {
        // Each variant should map to the correct numeric discriminant (0-indexed)
        assert_eq!(TdpError::ZeroAmount as u32, 0);
        assert_eq!(TdpError::InvalidTimeRange as u32, 1);
        assert_eq!(TdpError::InvalidCliffTime as u32, 2);
        assert_eq!(TdpError::DurationTooShort as u32, 3);
        assert_eq!(TdpError::InsufficientBalance as u32, 4);
        assert_eq!(TdpError::UnsupportedTokenProgram as u32, 5);
        assert_eq!(TdpError::TokenHasTransferHook as u32, 6);
        assert_eq!(TdpError::CliffNotReached as u32, 7);
        assert_eq!(TdpError::NothingToWithdraw as u32, 8);
        assert_eq!(TdpError::AlreadyCancelled as u32, 9);
        assert_eq!(TdpError::FullyVested as u32, 10);
        assert_eq!(TdpError::StartTimeInPast as u32, 11);
        assert_eq!(TdpError::StreamExpired as u32, 12);
        assert_eq!(TdpError::ExceedsClaimable as u32, 13);
        assert_eq!(TdpError::Unauthorized as u32, 14);
        assert_eq!(TdpError::MilestoneAlreadyTriggered as u32, 15);
        assert_eq!(TdpError::AlreadyWithdrawn as u32, 16);
        assert_eq!(TdpError::ArithmeticOverflow as u32, 17);
    }

    #[test]
    fn test_error_messages() {
        assert_eq!(
            TdpError::ZeroAmount.to_string(),
            "Amount must be greater than zero."
        );
        assert_eq!(
            TdpError::InvalidTimeRange.to_string(),
            "start_time must be before end_time."
        );
        assert_eq!(
            TdpError::InvalidCliffTime.to_string(),
            "cliff_time must be between start_time and end_time."
        );
        assert_eq!(
            TdpError::DurationTooShort.to_string(),
            "Stream duration must be at least 60 seconds."
        );
        assert_eq!(
            TdpError::InsufficientBalance.to_string(),
            "Sender does not have enough token balance."
        );
        assert_eq!(
            TdpError::UnsupportedTokenProgram.to_string(),
            "Unsupported token program. Only SPL Token is supported."
        );
        assert_eq!(
            TdpError::TokenHasTransferHook.to_string(),
            "Token mint has a transfer hook; not supported."
        );
        assert_eq!(
            TdpError::CliffNotReached.to_string(),
            "Cliff time has not been reached yet."
        );
        assert_eq!(
            TdpError::NothingToWithdraw.to_string(),
            "No tokens are available to withdraw at this time."
        );
        assert_eq!(
            TdpError::AlreadyCancelled.to_string(),
            "Stream is already cancelled."
        );
        assert_eq!(
            TdpError::ExceedsClaimable.to_string(),
            "Requested amount exceeds claimable tokens."
        );
        assert_eq!(
            TdpError::Unauthorized.to_string(),
            "You are not authorized to perform this action."
        );
        assert_eq!(
            TdpError::FullyVested.to_string(),
            "Stream is fully vested; no tokens remain to cancel."
        );
        assert_eq!(
            TdpError::StartTimeInPast.to_string(),
            "Stream start time must be in the future."
        );
        assert_eq!(
            TdpError::StreamExpired.to_string(),
            "Stream duration has ended; no cancel allowed."
        );
        assert_eq!(
            TdpError::MilestoneAlreadyTriggered.to_string(),
            "Milestone has already been triggered."
        );
        assert_eq!(
            TdpError::AlreadyWithdrawn.to_string(),
            "Tokens have already been withdrawn from this milestone."
        );
        assert_eq!(
            TdpError::ArithmeticOverflow.to_string(),
            "Arithmetic overflow in vesting calculation."
        );
    }
}
