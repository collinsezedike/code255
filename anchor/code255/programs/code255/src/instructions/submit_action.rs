use anchor_lang::prelude::*;

use crate::constants::{GAME_SEED, PLAYER_SEED};
use crate::error::Code255Error;
use crate::state::{Action, Game, Player};

#[derive(Accounts)]
pub struct SubmitAction<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, player.username.as_str().as_bytes(), game.key().as_ref()],
        bump = player.bump
    )]
    pub player: Account<'info, Player>,

    #[account(
        seeds = [GAME_SEED, game.game_code.to_le_bytes().as_ref()],
        bump = game.bump,
        has_one = admin
    )]
    pub game: Account<'info, Game>,

    pub system_program: Program<'info, System>,
}

impl<'info> SubmitAction<'info> {
    pub fn submit_action(&mut self, action: Action) -> Result<()> {
        require!(
            !self.player.is_eliminated,
            Code255Error::PlayerAlreadyEliminated
        );
        require!(
            self.player.action.is_none(),
            Code255Error::PlayerAlreadySubmittedAction
        );

        self.player.action = Some(action);
        self.game.submitted_actions = self
            .game
            .submitted_actions
            .checked_add(1)
            .ok_or(Code255Error::OutOfRange)?;

        Ok(())
    }
}
