use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak;

pub fn derive_round_seed(round: u8) -> [u8; 32] {
    let clock = Clock::get().unwrap();
    let slot = clock.slot.to_le_bytes();
    let ts = clock.unix_timestamp.to_le_bytes();

    let mut buf = Vec::with_capacity(slot.len() + ts.len() + 1);
    buf.extend_from_slice(&slot);
    buf.extend_from_slice(&ts);
    buf.push(round); // include round number as a differentiator

    // Hash the collected data
    let seed = keccak::hash(&buf);

    seed.0
}

pub fn hash_players_with_round_seed(players: &[Pubkey], seed: &[u8; 32]) -> [u8; 32] {
    // Pre-allocate enough space for seed + players
    let mut bytes = Vec::with_capacity(seed.len() + players.len() * 32);

    // Append seed first
    bytes.extend_from_slice(seed);

    // Append all player pubkeys
    for p in players {
        bytes.extend_from_slice(&p.to_bytes());
    }

    // Compute keccak hash
    let hash = keccak::hash(&bytes);

    hash.0
}
