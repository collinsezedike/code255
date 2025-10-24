use anchor_lang::prelude::*;

use crate::constants::GAME_SEED;
use crate::state::Game;

#[derive(Accounts)]
#[instruction(game_code: u64)]
pub struct CreateGame<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [GAME_SEED, game_code.to_le_bytes().as_ref()],
        space = 8 + Game::INIT_SPACE,
        bump
    )]
    pub game: Account<'info, Game>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateGame<'info> {
    pub fn create_game(
        &mut self,
        game_code: u64,
        active_players: u16,
        bumps: &CreateGameBumps
    ) -> Result<()> {
        self.game.set_inner(Game {
            bump: bumps.game,
            round: 0,
            round_seed: None,
            active_players,
            game_code,
        });

        Ok(())
    }
}
