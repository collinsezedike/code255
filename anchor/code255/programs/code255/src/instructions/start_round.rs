use anchor_lang::prelude::*;

use crate::constants::GAME_SEED;
use crate::error::Code255Error;
use crate::state::Game;
use crate::utils::hash_players;

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
    pub fn start_round(&mut self, players: Vec<Pubkey>) -> Result<()> {
        self.game.players_hash = Some(hash_players(&players));
        self.game.round = self
            .game
            .round
            .checked_add(1)
            .ok_or(Code255Error::OutOfRange)?;
        Ok(())
    }
}
