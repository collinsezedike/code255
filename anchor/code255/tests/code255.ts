import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Code255 } from "../target/types/code255";
import { expect } from "chai";

describe("code255", () => {
	anchor.setProvider(anchor.AnchorProvider.env());

	const program = anchor.workspace.code255 as Program<Code255>;

	const SYSTEM_PROGRAM_ID = anchor.web3.SystemProgram.programId;

	let admin: anchor.web3.Keypair;
	let game: anchor.web3.PublicKey;

	const gameCode = new anchor.BN(Math.floor(Math.random() * 9e7) + 1e7);

	before(async () => {
		admin = anchor.getProvider().wallet.payer;

		[game] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("game"), gameCode.toBuffer("le", 8)],
			program.programId
		);
	});

	it("Create game", async () => {
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
});
