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
