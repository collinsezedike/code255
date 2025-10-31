// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { Code255 } from "../target/types/code255";
// import { expect } from "chai";

// const SYSTEM_PROGRAM_ID = anchor.web3.SystemProgram.programId;
// const ER_VALIDATOR = new anchor.web3.PublicKey(
// 	"mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev"
// );

// describe("magic255 - ER and VRF Tests", () => {
// 	anchor.setProvider(anchor.AnchorProvider.env());

// 	const program = anchor.workspace.code255 as Program<Code255>;

// 	const providerEphemeralRollup = new anchor.AnchorProvider(
// 		new anchor.web3.Connection(
// 			process.env.EPHEMERAL_PROVIDER_ENDPOINT ||
// 				"https://devnet.magicblock.app/",
// 			{
// 				wsEndpoint:
// 					process.env.EPHEMERAL_WS_ENDPOINT ||
// 					"wss://devnet.magicblock.app/",
// 			}
// 		),
// 		anchor.Wallet.local()
// 	);

// 	const ephemeralProgram = new Program(program.idl, providerEphemeralRollup);

// 	const modifyComputeUnits =
// 		anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
// 			units: 400_000,
// 		});
// 	const addPriorityFee = anchor.web3.ComputeBudgetProgram.setComputeUnitPrice(
// 		{
// 			microLamports: 1,
// 		}
// 	);

// 	let admin: anchor.web3.Keypair;
// 	let game: anchor.web3.PublicKey;
// 	let ephemeralGame: anchor.web3.PublicKey;
// 	let player: anchor.web3.PublicKey;

// 	const playerUsername = "player_username";
// 	const gameCode = new anchor.BN(Math.floor(Math.random() * 9e7) + 1e7);

// 	before(async () => {
// 		admin = anchor.getProvider().wallet.payer;

// 		[game] = anchor.web3.PublicKey.findProgramAddressSync(
// 			[Buffer.from("game"), gameCode.toBuffer("le", 8)],
// 			program.programId
// 		);

// 		[ephemeralGame] = anchor.web3.PublicKey.findProgramAddressSync(
// 			[Buffer.from("game"), gameCode.toBuffer("le", 8)],
// 			ephemeralProgram.programId
// 		);

// 		[player] = anchor.web3.PublicKey.findProgramAddressSync(
// 			[
// 				Buffer.from("player"),
// 				Buffer.from(playerUsername),
// 				game.toBuffer(),
// 			],
// 			program.programId
// 		);
// 	});

// 	it("create game", async () => {
// 		await program.methods
// 			.createGame(gameCode)
// 			.accountsStrict({
// 				admin: admin.publicKey,
// 				game,
// 				systemProgram: SYSTEM_PROGRAM_ID,
// 			})
// 			.signers([admin])
// 			.rpc();

// 		const gameAccount = await program.account.game.fetch(game);
// 		expect(gameAccount.admin.toBase58()).equals(admin.publicKey.toBase58());
// 		expect(gameAccount.gameCode.toNumber()).to.equal(gameCode.toNumber());
// 		expect(gameAccount.activePlayers).to.equal(0);
// 		expect(gameAccount.submittedActions).to.equal(0);
// 		expect(gameAccount.round).to.equal(0);
// 		expect(gameAccount.roundSeed).to.be.null;
// 		expect(gameAccount.playersHash).to.be.null;
// 	});

// 	it("join game", async () => {
// 		await program.methods
// 			.joinGame(playerUsername)
// 			.accountsStrict({
// 				admin: admin.publicKey,
// 				player,
// 				game,
// 				systemProgram: SYSTEM_PROGRAM_ID,
// 			})
// 			.signers([admin])
// 			.rpc();

// 		const playerAccount = await program.account.player.fetch(player);
// 		expect(playerAccount.username).to.equals(playerUsername);
// 		expect(playerAccount.isEliminated).to.be.false;
// 		expect(playerAccount.action).to.be.null;
// 		expect(playerAccount.cardNumber).to.be.null;
// 	});

// 	it("delegate game", async () => {
// 		const tx = await program.methods
// 			.delegateGame(gameCode)
// 			.accounts({
// 				//@ts-ignore
// 				game,
// 				admin: admin.publicKey,
// 				validator: ER_VALIDATOR,
// 			})
// 			.rpc();

// 		console.log("Your transaction signature", tx);
// 	});

// 	it("request round seed", async () => {
// 		const tx = new anchor.web3.Transaction()
// 			.add(modifyComputeUnits)
// 			.add(addPriorityFee)
// 			.add(
// 				await ephemeralProgram.methods
// 					.requestRoundSeed(gameCode)
// 					.instruction()
// 			);

// 		const sig = await providerEphemeralRollup.sendAndConfirm(tx);
// 		console.log("Your transaction signature", sig);
// 	});

// 	it("start round", async () => {
// 		const players = [player, player, player];

// 		await ephemeralProgram.methods
// 			.startRound(players)
// 			.accountsStrict({
// 				admin: admin.publicKey,
// 				game,
// 			})
// 			.signers([admin])
// 			.rpc();

// 		const gameAccount = await program.account.game.fetch(game);

// 		const ephemeralGameAccount =
// 			await ephemeralProgram.coder.accounts.decode(
// 				"game",
// 				ephemeralGame.toBuffer()
// 			);
// 		const nonEphemeralGameAccount =
// 			await ephemeralProgram.coder.accounts.decode(
// 				"game",
// 				game.toBuffer()
// 			);

// 		console.log(gameAccount, {
// 			ephemeralGameAccount,
// 			nonEphemeralGameAccount,
// 		});

// 		expect(gameAccount.activePlayers).to.equal(players.length);
// 		expect(gameAccount.playersHash).to.not.be.null;
// 		expect(gameAccount.roundSeed).to.not.be.null;
// 		expect(gameAccount.round).to.equal(1);
// 	});

// 	it("undelegate game", async () => {
// 		const tx = await ephemeralProgram.methods
// 			.undelegate(gameCode)
// 			.rpc({ skipPreflight: true });
// 		console.log("Your transaction signature", tx);
// 	});
// });
