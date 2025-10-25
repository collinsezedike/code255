use anchor_lang::prelude::*;
use ephemeral_vrf_sdk::anchor::vrf;
use ephemeral_vrf_sdk::instructions::{create_request_randomness_ix, RequestRandomnessParams};
use ephemeral_vrf_sdk::types::SerializableAccountMeta;

use crate::constants::GAME_SEED;
use crate::state::Game;

#[vrf]
#[derive(Accounts)]
pub struct RequestRoundSeed<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_SEED, game.game_code.to_le_bytes().as_ref()],
        bump = game.bump,
        has_one = admin
    )]
    pub game: Account<'info, Game>,

    /// CHECK: Magicblock Oracle queue
    #[account(mut, address = ephemeral_vrf_sdk::consts::DEFAULT_QUEUE)]
    pub oracle_queue: AccountInfo<'info>,
}

impl<'info> RequestRoundSeed<'info> {
    pub fn request_round_seed(&mut self) -> Result<()> {
        let ix = create_request_randomness_ix(RequestRandomnessParams {
            payer: self.admin.key(),
            oracle_queue: self.oracle_queue.key(),
            callback_program_id: crate::ID,
            callback_discriminator: crate::instruction::StoreRoundSeed::DISCRIMINATOR.to_vec(),
            caller_seed: [self.game.round; 32],
            accounts_metas: Some(vec![SerializableAccountMeta {
                pubkey: self.game.key(),
                is_signer: false,
                is_writable: true,
            }]),
            ..Default::default()
        });
        self.invoke_signed_vrf(&self.admin.to_account_info(), &ix)?;
        Ok(())
    }
}
