use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Game {
    pub bump: u8,
    pub round: u8,
    pub round_seed: Option<u8>,
    pub active_players: u16,
    pub game_code: u64,
    pub admin: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub bump: u8,
    pub card_number: Option<u16>,
    pub action: Option<Action>,
    #[max_len(16)]
    pub username: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace, PartialEq, Eq)]
pub enum Action {
    Shoot(Pubkey),
    Forgive,
}
