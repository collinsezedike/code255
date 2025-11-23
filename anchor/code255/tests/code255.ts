import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Code255 } from "../target/types/code255";
import { expect } from "chai";

const SYSTEM_PROGRAM_ID = anchor.web3.SystemProgram.programId;

describe("code255", () => {
	anchor.setProvider(anchor.AnchorProvider.env());

	const program = anchor.workspace.code255 as Program<Code255>;

	let admin: anchor.web3.Keypair;
	let game: anchor.web3.PublicKey;
	let player: anchor.web3.PublicKey;

	const playerUsername = "player_username";
	const gameCode = new anchor.BN(Math.floor(Math.random() * 9e7) + 1e7);

	before(async () => {
		admin = anchor.getProvider().wallet.payer;

		[game] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("game"), gameCode.toBuffer("le", 8)],
			program.programId
		);

		[player] = anchor.web3.PublicKey.findProgramAddressSync(
			[
				Buffer.from("player"),
				Buffer.from(playerUsername),
				game.toBuffer(),
			],
			program.programId
		);
	});

	it("create game", async () => {
		await program.methods
			.createGame(gameCode)
			.accountsStrict({
				admin: admin.publicKey,
				game,
				systemProgram: SYSTEM_PROGRAM_ID,
			})
			.signers([admin])
			.rpc();

		const gameAccount = await program.account.game.fetch(game);
		expect(gameAccount.admin.toBase58()).equals(admin.publicKey.toBase58());
		expect(gameAccount.gameCode.toNumber()).to.equal(gameCode.toNumber());
		expect(gameAccount.activePlayers).to.equal(0);
		expect(gameAccount.submittedActions).to.equal(0);
		expect(gameAccount.round).to.equal(0);
		expect(gameAccount.roundSeed).to.be.null;
		expect(gameAccount.playersHash).to.be.null;
	});

	it("join game", async () => {
		await program.methods
			.joinGame(playerUsername)
			.accountsStrict({
				admin: admin.publicKey,
				player,
				game,
				systemProgram: SYSTEM_PROGRAM_ID,
			})
			.signers([admin])
			.rpc();

		const playerAccount = await program.account.player.fetch(player);
		expect(playerAccount.username).to.equals(playerUsername);
		expect(playerAccount.isEliminated).to.be.false;
		expect(playerAccount.action).to.be.null;
		expect(playerAccount.cardNumber).to.be.null;
	});

	it("update round seed", async () => {
		await program.methods
			.updateRoundSeed()
			.accountsStrict({
				admin: admin.publicKey,
				game,
			})
			.signers([admin])
			.rpc();

		const gameAccount = await program.account.game.fetch(game);
		expect(gameAccount.roundSeed).to.not.be.null;
	});

	it("start round", async () => {
		const players = [player, player, player];

		await program.methods
			.startRound(players)
			.accountsStrict({
				admin: admin.publicKey,
				game,
			})
			.signers([admin])
			.rpc();

		const gameAccount = await program.account.game.fetch(game);
		expect(gameAccount.activePlayers).to.equal(players.length);
		expect(gameAccount.playersHash).to.not.be.null;
		expect(gameAccount.round).to.equal(1);
	});

	it("update seed and start round", async () => {
		const players = [player, player, player];

		const updateRoundSeedIx = await program.methods
			.updateRoundSeed()
			.accountsStrict({ admin: admin.publicKey, game })
			.instruction();

		const startRoundIx = await program.methods
			.startRound(players)
			.accountsStrict({ admin: admin.publicKey, game })
			.instruction();

		const connection = anchor.getProvider().connection;
		const latestBlockhash = await connection.getLatestBlockhash();

		const message = new anchor.web3.TransactionMessage({
			instructions: [updateRoundSeedIx, startRoundIx],
			payerKey: admin.publicKey,
			recentBlockhash: latestBlockhash.blockhash,
		}).compileToV0Message();

		const tx = new anchor.web3.VersionedTransaction(message).sign([admin]);
		tx.sign([admin]);

		const txHash = await connection.sendTransaction(tx);
		await connection.confirmTransaction({
			blockhash: latestBlockhash.blockhash,
			lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
			signature: txHash,
		});

		const gameAccount = await program.account.game.fetch(game);
		expect(gameAccount.roundSeed).to.not.be.null;
		expect(gameAccount.activePlayers).to.equal(players.length);
		expect(gameAccount.playersHash).to.not.be.null;
		expect(gameAccount.round).to.equal(2);
	});
});
