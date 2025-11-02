import * as anchor from "@coral-xyz/anchor";
import {
	clusterApiUrl,
	Connection,
	PublicKey,
	TransactionInstruction,
	TransactionMessage,
	VersionedTransaction,
} from "@solana/web3.js";
import { Code255 } from "./program_types";
import IDL from "./program_idl.json";
import { RPC_URL } from "./config";

const SYSTEM_PROGRAM_ID = anchor.web3.SystemProgram.programId;

const connection = new Connection(RPC_URL || clusterApiUrl("devnet"), {
	commitment: "confirmed",
});

export const program = new anchor.Program<Code255>(IDL, { connection });

const getGamePDA = (gameCode: anchor.BN): PublicKey => {
	const [game] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("game"), gameCode.toBuffer("le", 8)],
		program.programId
	);
	return game;
};

const getPlayerPDA = (playerUsername: string, game: PublicKey): PublicKey => {
	const [player] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("player"), Buffer.from(playerUsername), game.toBuffer()],
		program.programId
	);
	return player;
};

const buildTransaction = async (
	feePayer: PublicKey,
	instruction: TransactionInstruction
): Promise<VersionedTransaction> => {
	const latestBlockhash = await connection.getLatestBlockhash();
	const message = new TransactionMessage({
		payerKey: feePayer,
		instructions: [instruction],
		recentBlockhash: latestBlockhash.blockhash,
	}).compileToV0Message();
	return new VersionedTransaction(message);
};

export async function createGame(gameCode: string, admin: string) {
	const adminPubKey = new PublicKey(admin);
	const gameCodeBN = new anchor.BN(gameCode);
	const game = getGamePDA(gameCodeBN);
	const ix = await program.methods
		.createGame(gameCodeBN)
		.accountsStrict({
			admin: adminPubKey,
			game,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	const txHash = await buildTransaction(adminPubKey, ix);
	return { connection, txHash, gameAddress: game };
}

export async function joinGame(
	playerUsername: string,
	game: PublicKey,
	admin: PublicKey
) {
	const player = getPlayerPDA(playerUsername, game);
	const ix = await program.methods
		.joinGame(playerUsername)
		.accountsStrict({
			admin,
			player,
			game,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	const txHash = await buildTransaction(admin, ix);
	return { connection, txHash, playerAddress: player };
}
