use anchor_lang::prelude::*;

#[error_code]
pub enum Code255Error {
    #[msg("The arithemetic operation resulted in an out-of-range value")]
    OutOfRange,

    #[msg("Game already started")]
    GameAlreadyStarted,

    #[msg("Game round has not ended")]
    GameRoundNotEnded,

    #[msg("Player already submitted an action")]
    PlayerAlreadySubmittedAction,

    #[msg("Player has already been eliminated")]
    PlayerAlreadyEliminated,

    #[msg("No player action was submitted")]
    PlayerActionNotSubmitted,

    #[msg("Target account not provided in the transaction context")]
    MissingTargetAccount,

    #[msg("Target account does not match the target shot")]
    TargetAccountMismatch,
}
