use anchor_lang::prelude::*;

use crate::constants::GAME_SEED;
use crate::error::Code255Error;
use crate::state::Game;
use crate::utils::derive_round_seed;

#[derive(Accounts)]
pub struct UpdateRoundSeed<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_SEED, game.game_code.to_le_bytes().as_ref()],
        bump = game.bump,
        has_one = admin
    )]
    pub game: Account<'info, Game>,
}

impl<'info> UpdateRoundSeed<'info> {
    pub fn update_round_seed(&mut self) -> Result<()> {
        let random_round_seed = derive_round_seed(self.game.round);
        self.game.round_seed = Some(random_round_seed);
        Ok(())
    }
}
