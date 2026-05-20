use anchor_lang::prelude::*;

#[event]
pub struct StreamCreated {
    pub stream: Pubkey,
    pub creator: Pubkey,
    pub recipient: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub start_time: i64,
    pub cliff_time: i64,
    pub end_time: i64,
}

#[event]
pub struct TokensClaimed {
    pub stream: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub claimed: u64,
    pub total_claimed: u64,
}

#[event]
pub struct StreamCompleted {
    pub stream: Pubkey,
    pub recipient: Pubkey,
    pub total_amount: u64,
}

#[event]
pub struct StreamCancelled {
    pub stream: Pubkey,
    pub creator: Pubkey,
    pub recipient: Pubkey,
    pub vested_to_recipient: u64,
    pub returned_to_creator: u64,
}

#[event]
pub struct MilestoneStreamCreated {
    pub stream: Pubkey,
    pub creator: Pubkey,
    pub recipient: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub milestone_authority: Pubkey,
}

#[event]
pub struct MilestoneTriggered {
    pub stream: Pubkey,
    pub milestone_authority: Pubkey,
}

#[event]
pub struct MilestoneCompleted {
    pub stream: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
}

#[event]
pub struct MilestoneCancelled {
    pub stream: Pubkey,
    pub creator: Pubkey,
    pub recipient: Pubkey,
    pub returned_to_creator: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_serialization_round_trip() {
        // StreamCreated
        let stream = Pubkey::new_unique();
        let creator = Pubkey::new_unique();
        let recipient = Pubkey::new_unique();
        let mint = Pubkey::new_unique();

        let created = StreamCreated {
            stream,
            creator,
            recipient,
            mint,
            amount: 1_000_000,
            start_time: 1000,
            cliff_time: 2000,
            end_time: 3000,
        };

        let mut buf = Vec::new();
        AnchorSerialize::serialize(&created, &mut buf).unwrap();
        let mut slice: &[u8] = &buf;
        let deserialized: StreamCreated = AnchorDeserialize::deserialize(&mut slice).unwrap();
        assert_eq!(deserialized.stream, stream);
        assert_eq!(deserialized.creator, creator);
        assert_eq!(deserialized.recipient, recipient);
        assert_eq!(deserialized.mint, mint);
        assert_eq!(deserialized.amount, 1_000_000);
        assert_eq!(deserialized.start_time, 1000);
        assert_eq!(deserialized.cliff_time, 2000);
        assert_eq!(deserialized.end_time, 3000);
    }

    #[test]
    fn test_tokens_claimed_round_trip() {
        let stream = Pubkey::new_unique();
        let recipient = Pubkey::new_unique();

        let claimed = TokensClaimed {
            stream,
            recipient,
            amount: 500_000,
            claimed: 300_000,
            total_claimed: 800_000,
        };

        let mut buf = Vec::new();
        AnchorSerialize::serialize(&claimed, &mut buf).unwrap();
        let mut slice: &[u8] = &buf;
        let deserialized: TokensClaimed = AnchorDeserialize::deserialize(&mut slice).unwrap();
        assert_eq!(deserialized.stream, stream);
        assert_eq!(deserialized.recipient, recipient);
        assert_eq!(deserialized.amount, 500_000);
        assert_eq!(deserialized.claimed, 300_000);
        assert_eq!(deserialized.total_claimed, 800_000);
    }

    #[test]
    fn test_stream_completed_round_trip() {
        let stream = Pubkey::new_unique();
        let recipient = Pubkey::new_unique();

        let completed = StreamCompleted {
            stream,
            recipient,
            total_amount: 1_000_000,
        };

        let mut buf = Vec::new();
        AnchorSerialize::serialize(&completed, &mut buf).unwrap();
        let mut slice: &[u8] = &buf;
        let deserialized: StreamCompleted = AnchorDeserialize::deserialize(&mut slice).unwrap();
        assert_eq!(deserialized.stream, stream);
        assert_eq!(deserialized.recipient, recipient);
        assert_eq!(deserialized.total_amount, 1_000_000);
    }

    #[test]
    fn test_stream_cancelled_round_trip() {
        let stream = Pubkey::new_unique();
        let creator = Pubkey::new_unique();
        let recipient = Pubkey::new_unique();

        let cancelled = StreamCancelled {
            stream,
            creator,
            recipient,
            vested_to_recipient: 400_000,
            returned_to_creator: 600_000,
        };

        let mut buf = Vec::new();
        AnchorSerialize::serialize(&cancelled, &mut buf).unwrap();
        let mut slice: &[u8] = &buf;
        let deserialized: StreamCancelled = AnchorDeserialize::deserialize(&mut slice).unwrap();
        assert_eq!(deserialized.stream, stream);
        assert_eq!(deserialized.creator, creator);
        assert_eq!(deserialized.recipient, recipient);
        assert_eq!(deserialized.vested_to_recipient, 400_000);
        assert_eq!(deserialized.returned_to_creator, 600_000);
    }
}
