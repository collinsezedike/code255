use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak;

pub fn hash_players(players: &[Pubkey]) -> [u8; 32] {
    // Flatten all player pubkeys into one byte vector
    let mut bytes = Vec::with_capacity(players.len() * 32);
    for p in players {
        bytes.extend_from_slice(&p.to_bytes());
    }

    // Compute the keccak hash
    let hash = keccak::hash(&bytes);
    hash.0
}
