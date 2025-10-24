use anchor_lang::prelude::*;

use crate::constants::{GAME_SEED, PLAYER_SEED};
use crate::error::Code255Error;
use crate::state::{Action, Game, Player};

#[derive(Accounts)]
pub struct ResolveAction<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, player.username.as_str().as_bytes(), game.key().as_ref()],
        bump = player.bump
    )]
    pub player: Account<'info, Player>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, target.username.as_str().as_bytes(), game.key().as_ref()],
        bump = target.bump
    )]
    pub target: Option<Account<'info, Player>>,

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

impl<'info> ResolveAction<'info> {
    pub fn resolve_action(&mut self, _players: Vec<Pubkey>) -> Result<()> {
        require!(
            self.game.submitted_actions == self.game.active_players,
            Code255Error::GameRoundNotEnded
        );

        match self.player.action {
            None => {
                return Err(Code255Error::PlayerActionNotSubmitted.into());
            }

            Some(Action::Forgive) => {} // Do nothing

            Some(Action::Shoot(target)) => {
                require!(!self.target.is_none(), Code255Error::MissingTargetAccount);

                let mut target_account = self.target.clone().unwrap();
                require!(
                    target_account.key() == target,
                    Code255Error::TargetAccountMismatch
                );

                // Derive Card Number
                let player_card_number = 1;
                let target_card_number = 2; // Or 2 -1 if target forgave
                if player_card_number >= target_card_number {
                    target_account.is_eliminated = true;
                }

                self.player.is_eliminated = true;

                self.game.active_players = self
                    .game
                    .active_players
                    .checked_sub(1)
                    .ok_or(Code255Error::OutOfRange)?;
            }
        }

        Ok(())
    }
}
