use anchor_lang::prelude::*;

use crate::constants::GAME_SEED;
use crate::state::Game;

#[derive(Accounts)]
pub struct StoreRoundSeed<'info> {
    /// This check ensure that the vrf_program_identity (which is a PDA) is a signer
    /// enforcing the callback is executed by the VRF program trough CPI
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,

    #[account(mut)]
    pub game: Account<'info, Game>,
}

impl<'info> StoreRoundSeed<'info> {
    pub fn store_round_seed(&mut self, randomness: [u8; 32]) -> Result<()> {
        self.game.round_seed = Some(randomness);
        Ok(())
    }
}
