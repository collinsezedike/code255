use anchor_lang::prelude::*;

#[error_code]
pub enum Code255Error {
    #[msg("Game already started")]
    GameAlreadyStarted,

    #[msg("The arithemetic operation resulted in an out-of-range value")]
    OutOfRange,

    #[msg("Player already submitted an action")]
    PlayerAlreadySubmittedAction,
}
