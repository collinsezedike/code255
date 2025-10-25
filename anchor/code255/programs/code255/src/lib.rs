pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("AMp4gissUxPZdfWReixw6kUdmZmzDQtKwTcnE84dPTxa");

#[program]
pub mod code255 {
    use super::*;

    pub fn create_game(
        ctx: Context<CreateGame>,
        game_code: u64,
        active_players: u16,
    ) -> Result<()> {
        ctx.accounts
            .create_game(game_code, active_players, &ctx.bumps)
    }

    pub fn join_game(ctx: Context<JoinGame>, username: String) -> Result<()> {
        ctx.accounts.join_game(username, &ctx.bumps)
    }

    pub fn request_round_seed(ctx: Context<RequestRoundSeed>) -> Result<()> {
        ctx.accounts.request_round_seed()
    }

    pub fn store_round_seed(ctx: Context<StoreRoundSeed>, randomness: [u8; 32]) -> Result<()> {
        ctx.accounts.store_round_seed(randomness)
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
}
