import * as anchor from "@coral-xyz/anchor";
import {
	clusterApiUrl,
	Connection,
	PublicKey,
	SystemProgram,
	TransactionInstruction,
	TransactionMessage,
	VersionedTransaction,
} from "@solana/web3.js";
import { Code255 } from "./program_types";
import IDL from "./program_idl.json";

const SYSTEM_PROGRAM_ID = SystemProgram.programId;

const connection = new Connection(clusterApiUrl("devnet"), {
	commitment: "confirmed",
});

export const program = new anchor.Program<Code255>(IDL, { connection });

export const getGamePDA = (gameCode: anchor.BN): PublicKey => {
	const [game] = PublicKey.findProgramAddressSync(
		[Buffer.from("game"), gameCode.toBuffer("le", 8)],
		program.programId
	);
	return game;
};

export const getPlayerPDA = (username: string, game: PublicKey): PublicKey => {
	const [player] = PublicKey.findProgramAddressSync(
		[Buffer.from("player"), Buffer.from(username), game.toBuffer()],
		program.programId
	);
	return player;
};

export const fetchGameAccountData = async (gameCode: string) => {
	try {
		const gameCodeBN = new anchor.BN(gameCode);
		const accountAddress = getGamePDA(gameCodeBN);
		const accountData = await program.account.game.fetch(accountAddress);
		return { ...accountData, address: accountAddress };
	} catch (error) {
		console.log(error);
		return null;
	}
};

export const fetchPlayerAccountData = async (
	username: string,
	game: PublicKey
) => {
	try {
		const accountAddress = getPlayerPDA(username, game);
		const accountData = await program.account.player.fetch(accountAddress);
		return { ...accountData, address: accountAddress };
	} catch (error) {
		return null;
	}
};

export const fetchAllPlayerAccounts = async () => {
	return await program.account.player.all();
};

const buildTransaction = async (
	feePayer: PublicKey,
	instructions: TransactionInstruction[]
): Promise<VersionedTransaction> => {
	const latestBlockhash = await connection.getLatestBlockhash();
	const message = new TransactionMessage({
		instructions,
		payerKey: feePayer,
		recentBlockhash: latestBlockhash.blockhash,
	}).compileToV0Message();
	return new VersionedTransaction(message);
};

export const deserializeTransactionInstruction = (
	txString: string
): TransactionInstruction => {
	const tx = VersionedTransaction.deserialize(
		Buffer.from(txString, "base64")
	);
	const msg = TransactionMessage.decompile(tx.message);
	return msg.instructions[0];
};

export const createGame = async (gameCode: string, admin: PublicKey) => {
	const gameCodeBN = new anchor.BN(gameCode);
	const game = getGamePDA(gameCodeBN);
	const ix = await program.methods
		.createGame(gameCodeBN)
		.accountsStrict({
			admin,
			game,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	return await buildTransaction(admin, [ix]);
};

export const joinGame = async (
	playerUsername: string,
	game: PublicKey,
	admin: PublicKey
) => {
	const player = getPlayerPDA(playerUsername, game);
	const ix = await program.methods
		.joinGame(playerUsername)
		.accountsStrict({
			player,
			admin,
			game,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	return await buildTransaction(admin, [ix]);
};

export const processJoinGameInstructions = async (
	admin: PublicKey,
	ixs: TransactionInstruction[]
) => {
	return await buildTransaction(admin, ixs);
};
