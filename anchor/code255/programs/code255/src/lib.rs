pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

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
        active_players: u16
    ) -> Result<()> {
        ctx.accounts.create_game(game_code, active_players, &ctx.bumps)
    }
}
