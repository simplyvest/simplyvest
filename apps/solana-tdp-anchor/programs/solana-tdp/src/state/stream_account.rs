use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct CreateStreamParams {
    pub amount: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub cliff_time: i64,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct CreatorConfig {
    pub creator: Pubkey,
    pub vesting_count: u64,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct StreamAccount {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub mint: Pubkey,
    pub vault: Pubkey,
    pub amount: u64,
    pub amount_withdrawn: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub cliff_time: i64,
    pub vesting_count: u64,
    pub cancelled: bool,
    pub bump: u8,
    pub vault_bump: u8,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_stream_account_layout() {
        // 8 discriminator + 4*32 (Pubkeys) + 5*8 (u64) + 8 (vesting_count) + 1 (bool) + 2 (u8)
        // = 8 + 128 + 40 + 8 + 1 + 2 = 187
        assert_eq!(StreamAccount::INIT_SPACE, 179);
        assert_eq!(8 + StreamAccount::INIT_SPACE, 187);
    }

    #[test]
    fn test_creator_config_size() {
        // 8 discriminator + 32 (Pubkey) + 8 (vesting_count) = 48
        assert_eq!(CreatorConfig::INIT_SPACE, 40);
        assert_eq!(8 + CreatorConfig::INIT_SPACE, 48);
    }

    #[test]
    fn test_creator_config_default() {
        let config = CreatorConfig {
            creator: Pubkey::default(),
            vesting_count: 0,
        };
        assert_eq!(config.vesting_count, 0);
    }
}
