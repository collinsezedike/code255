use anchor_lang::prelude::*;

use crate::constants::{GAME_SEED, PLAYER_SEED};
use crate::error::Code255Error;
use crate::state::{Action, Game, Player};

#[derive(Accounts)]
pub struct ResolveAction<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

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
        mut,
        seeds = [GAME_SEED, game.game_code.to_le_bytes().as_ref()],
        bump = game.bump,
        has_one = admin
    )]
    pub game: Account<'info, Game>,

    pub system_program: Program<'info, System>,
}

impl<'info> ResolveAction<'info> {
    pub fn resolve_action(&mut self, players: Vec<Pubkey>) -> Result<()> {
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
                    Code255Error::InvalidTargetAccount
                );

                // Verify the players hash
                // require!(Hash(players) == self.game.players_hash, Code255Error::InvalidPlayersHash)

                let player_card_number = 1 + players
                    .iter()
                    .position(|p| *p == self.player.key())
                    .ok_or(Code255Error::PlayerPubkeyNotFound)?;
                let target_card_number = 1 + players
                    .iter()
                    .position(|p| *p == target_account.key())
                    .ok_or(Code255Error::PlayerPubkeyNotFound)?;

                if player_card_number >= target_card_number {
                    if !target_account.is_eliminated {
                        target_account.is_eliminated = true;
                        self.game.active_players = self
                            .game
                            .active_players
                            .checked_sub(1)
                            .ok_or(Code255Error::OutOfRange)?;
                    }
                } else {
                    if !self.player.is_eliminated {
                        self.player.is_eliminated = true;
                        self.game.active_players = self
                            .game
                            .active_players
                            .checked_sub(1)
                            .ok_or(Code255Error::OutOfRange)?;
                    }
                }
            }
        }

        Ok(())
    }
}
