use anchor_lang::prelude::*;

use crate::constants::GAME_SEED;
use crate::state::Game;

#[derive(Accounts)]
pub struct StartRound<'info> {
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

impl<'info> StartRound<'info> {
    pub fn start_round(&mut self, _players: Vec<Pubkey>) -> Result<()> {
        // Hash players list
        // Store it in the self.game.players_hash
        Ok(())
    }
}
