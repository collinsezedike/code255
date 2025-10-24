use anchor_lang::prelude::*;

use crate::constants::{GAME_SEED, PLAYER_SEED};
use crate::state::{Game, Player};

#[derive(Accounts)]
#[instruction(username: String)]
pub struct JoinGame<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        seeds = [PLAYER_SEED, username.as_str().as_bytes(), game.key().as_ref()],
        space = 8 + Player::INIT_SPACE,
        bump
    )]
    pub player: Account<'info, Player>,

    #[account(
        seeds = [GAME_SEED, game.game_code.to_le_bytes().as_ref()],
        bump = game.bump,
        has_one = admin
    )]
    pub game: Account<'info, Game>,

    /// CHECK: This is the game admin and is verified in the game account
    pub admin: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> JoinGame<'info> {
    pub fn join_game(&mut self, username: String, bumps: &JoinGameBumps) -> Result<()> {
        self.player.set_inner(Player {
            bump: bumps.player,
            card_number: None,
            action: None,
            username,
        });

        Ok(())
    }
}
