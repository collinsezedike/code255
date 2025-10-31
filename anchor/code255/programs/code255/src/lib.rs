pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::{commit, delegate, ephemeral};
use ephemeral_rollups_sdk::cpi::DelegateConfig;
use ephemeral_rollups_sdk::ephem::commit_and_undelegate_accounts;
use ephemeral_vrf_sdk::anchor::vrf;
use ephemeral_vrf_sdk::instructions::{create_request_randomness_ix, RequestRandomnessParams};
use ephemeral_vrf_sdk::types::SerializableAccountMeta;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("AMp4gissUxPZdfWReixw6kUdmZmzDQtKwTcnE84dPTxa");

#[ephemeral]
#[program]
pub mod code255 {
    use super::*;

    pub fn create_game(ctx: Context<CreateGame>, game_code: u64) -> Result<()> {
        ctx.accounts.create_game(game_code, &ctx.bumps)
    }

    pub fn join_game(ctx: Context<JoinGame>, username: String) -> Result<()> {
        ctx.accounts.join_game(username, &ctx.bumps)
    }

    pub fn update_round_seed(ctx: Context<UpdateRoundSeed>) -> Result<()> {
        ctx.accounts.update_round_seed()
    }

    pub fn start_round(ctx: Context<StartRound>, players: Vec<Pubkey>) -> Result<()> {
        ctx.accounts.start_round(players)
    }

    pub fn submit_action(ctx: Context<SubmitAction>, action: Action) -> Result<()> {
        ctx.accounts.submit_action(action)
    }

    pub fn resolve_action(ctx: Context<ResolveAction>, players: Vec<Pubkey>) -> Result<()> {
        ctx.accounts.resolve_action(players)
    }

    pub fn request_round_seed(ctx: Context<RequestRoundSeed>, _game_code: u64) -> Result<()> {
        let ix = create_request_randomness_ix(RequestRandomnessParams {
            payer: ctx.accounts.admin.key(),
            oracle_queue: ctx.accounts.oracle_queue.key(),
            callback_program_id: ID,
            callback_discriminator: instruction::StoreRoundSeed::DISCRIMINATOR.to_vec(),
            caller_seed: [ctx.accounts.game.round + 1; 32], // The game round value will be updated in the start round instruction
            accounts_metas: Some(vec![SerializableAccountMeta {
                pubkey: ctx.accounts.game.key(),
                is_signer: false,
                is_writable: true,
            }]),
            ..Default::default()
        });
        ctx.accounts
            .invoke_signed_vrf(&ctx.accounts.admin.to_account_info(), &ix)?;

        Ok(())
    }

    pub fn store_round_seed(ctx: Context<StoreRoundSeedCtx>, randomness: [u8; 32]) -> Result<()> {
        ctx.accounts.game.round_seed = Some(randomness);
        Ok(())
    }

    pub fn delegate_game(ctx: Context<DelegateGame>, game_code: u64) -> Result<()> {
        let validator = ctx.accounts.validator.as_ref().map(|v| v.key());
        ctx.accounts.delegate_game(
            &ctx.accounts.admin,
            &[GAME_SEED, game_code.to_le_bytes().as_ref()],
            DelegateConfig {
                validator,
                ..Default::default()
            },
        )?;
        Ok(())
    }

    pub fn undelegate(ctx: Context<UndelegateGame>, _game_code: u64) -> Result<()> {
        commit_and_undelegate_accounts(
            &ctx.accounts.admin,
            vec![&ctx.accounts.game.to_account_info()],
            &ctx.accounts.magic_context,
            &ctx.accounts.magic_program,
        )?;
        Ok(())
    }
}

#[vrf]
#[derive(Accounts)]
#[instruction(game_code: u64)]
pub struct RequestRoundSeed<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_SEED, game_code.to_le_bytes().as_ref()],
        bump,
    )]
    pub game: Account<'info, Game>,

    /// CHECK: Magicblock Oracle queue
    #[account(mut, address = ephemeral_vrf_sdk::consts::DEFAULT_EPHEMERAL_QUEUE)]
    pub oracle_queue: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct StoreRoundSeedCtx<'info> {
    /// This check ensure that the vrf_program_identity (which is a PDA) is a signer
    /// enforcing the callback is executed by the VRF program through CPI
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,

    #[account(mut)]
    pub game: Account<'info, Game>,
}

#[delegate]
#[derive(Accounts)]
#[instruction(game_code: u64)]
pub struct DelegateGame<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: Checked by the delegate program
    pub validator: Option<AccountInfo<'info>>,

    /// CHECK: The pda to delegate
    #[account(
        mut,
        del,
        seeds = [GAME_SEED, game_code.to_le_bytes().as_ref()],
        bump
    )]
    pub game: AccountInfo<'info>,
}

#[commit]
#[derive(Accounts)]
#[instruction(game_code: u64)]
pub struct UndelegateGame<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_SEED, game_code.to_le_bytes().as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
}
