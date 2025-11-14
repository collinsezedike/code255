import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { RetroButton } from "../components/RetroButton";
import { RetroCard } from "../components/RetroCard";
import { Users } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
	fetchAllPlayerAccounts,
	fetchGameAccountData,
	processJoinGameInstructions,
	startRound,
} from "../lib/program_instructions";
import { AdminSocketResponse, TransferredState } from "../lib/types";
import { createSocket } from "../lib/socket";

export const AdminLobby: React.FC = () => {
	const navigate = useNavigate();
	const { state } = useLocation();
	const { setVisible } = useWalletModal();
	const { wallet, signTransaction } = useWallet();
	const { connection } = useConnection();
	const { gameState } = useGame();

	const [error, setError] = useState("");
	const [players, setPlayers] = useState<any[]>([]);
	const [admittedPlayersCount, setAdmittedPlayersCount] = useState(0);
	const [joinInstructions, setJoinInstructions] = useState<string[]>([]);

	const [gameAccountData, setGameAccountData] =
		useState<Awaited<ReturnType<typeof fetchGameAccountData>>>(null);

	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => setError(""), 5000);
			return () => clearTimeout(timer);
		}
	}, [error]);

	useEffect(() => {
		const fetchData = async () => {
			// NOTE TO SELF: Might no longer need to delay a bit since we're already confirming the transaction in the previous page
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait a while for the create game transaction to finalize
			const gameAccount = await fetchGameAccountData(state.gameCode);
			if (!gameAccount) navigate("/admin");
			else setGameAccountData(gameAccount);
		};

		if (!state || !state.gameCode) navigate("/admin");
		fetchData();
	}, []);

	let { gameCode, socket } = state as TransferredState;

	if (!socket) socket = createSocket("admin", gameCode);
	if (!socket.isConnected) socket.connect();

	socket.onMessage((msg) => {
		setJoinInstructions((prev) => [...prev, msg.content]);
		setPlayers((prev) => [...prev, { username: msg.sender }]);
		socket.send({
			content: AdminSocketResponse.ADMITTED,
			recipient: msg.sender,
			role: "admin",
			sender: gameCode,
			type: "admin_message",
		});
	});

	const formatGameCode = (code: string) => {
		if (!code) return "####-####";
		const cleaned = String(code).replace(/[^a-zA-Z0-9]/g, "");
		return cleaned.match(/.{1,4}/g)?.join("-") || "";
	};

	const handleApproveJoinRequests = async () => {
		if (!wallet?.adapter.publicKey) {
			setVisible(true);
			return;
		}

		if (!signTransaction) {
			setError("WALLET DOES NOT SUPPORT SIGNING TRANSACTIONS");
			return;
		}

		if (!gameAccountData) return navigate("/admin");

		// Check if wallet address matches the game owner address
		if (gameAccountData.admin != wallet.adapter.publicKey) {
			setError("INVALID ADMIN WALLET");
			return;
		}

		const tx = await processJoinGameInstructions(
			wallet.adapter.publicKey,
			joinInstructions
		);
		const signedTx = await signTransaction(tx);
		const signature = await connection.sendRawTransaction(
			signedTx.serialize()
		);
		const latestBlockhash = await connection.getLatestBlockhash();
		await connection.confirmTransaction({
			blockhash: latestBlockhash.blockhash,
			lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
			signature: signature,
		});

		setAdmittedPlayersCount(admittedPlayersCount + joinInstructions.length);
		setJoinInstructions([]); // Empty the array
	};

	const handleStartGame = async () => {
		if (!gameAccountData) return navigate("/admin");

		if (!wallet?.adapter.publicKey) {
			setVisible(true);
			return;
		}

		if (!signTransaction) {
			setError("WALLET DOES NOT SUPPORT SIGNING TRANSACTIONS");
			return;
		}

		// 1. Fetch players list
		const players = await fetchAllPlayerAccounts();

		// 2. Update round seed & 3. Start round
		const tx = await startRound(
			players.map((p) => p.publicKey),
			wallet.adapter.publicKey,
			gameAccountData.address
		);
		const signedTx = await signTransaction(tx);
		const signature = await connection.sendRawTransaction(
			signedTx.serialize()
		);
		const latestBlockhash = await connection.getLatestBlockhash();
		await connection.confirmTransaction({
			blockhash: latestBlockhash.blockhash,
			lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
			signature: signature,
		});

		// 4. Broadcast to players
		players.forEach((p) => {
			socket.send({
				content: AdminSocketResponse.ROUND_STARTED,
				recipient: p.account.username,
				role: "admin",
				sender: gameCode,
				type: "admin_message",
			});
		});

		// 5. Navigate to next page
		navigate("/admin/round", { state: { gameCode, socket } });
	};

	return (
		<div className="min-h-screen bg-black text-green-500 p-8 font-mono">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-6xl font-bold mb-4 tracking-wider retro-flicker">
						CODE 255
					</h1>
					<div className="text-2xl text-green-400 mb-2">
						ADMIN CONTROL CENTER
					</div>
					<div className="text-sm text-green-600">
						[GAME INITIALIZED]
					</div>
				</div>

				{error && (
					<div className="mb-6 border-2 border-red-500 bg-red-950 p-4 text-center animate-pulse">
						<div className="text-red-500 font-bold">
							&gt; ERROR: {error}
						</div>
					</div>
				)}

				{!wallet && (
					<RetroCard glow className="py-16">
						<div className="space-y-6 text-center">
							<>
								<div className="text-xl mb-4 tracking-wider">
									ESTABLISH SECURE LINK
								</div>
								<RetroButton
									onClick={() => setVisible(true)}
									variant="primary"
									className="text-xl px-10 py-4"
								>
									CONNECT WALLET
								</RetroButton>
							</>
						</div>
					</RetroCard>
				)}

				{wallet && (
					<>
						<RetroCard className="mb-8" glow>
							<div className="text-center">
								<div className="text-xl mb-2">GAME CODE</div>
								<div className="text-7xl font-bold tracking-widest my-6 retro-flicker">
									{formatGameCode(state.gameCode)}
								</div>
								<div className="text-sm text-green-400">
									SHARE THIS CODE WITH PLAYERS
								</div>
							</div>
						</RetroCard>

						<RetroCard className="mb-8">
							<div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-green-500">
								<Users className="w-6 h-6" />
								<h2 className="text-2xl uppercase">
									CONNECTED PLAYERS [{players.length}]
								</h2>
							</div>

							{players.length === 0 ? (
								<div className="text-center py-12 text-green-600">
									<div className="text-xl mb-2">
										WAITING FOR PLAYERS
										<div className="animate-pulse">...</div>
									</div>
								</div>
							) : (
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									{players.map((player) => (
										<div
											key={player.username}
											className="border border-green-500 p-4 text-center slide-in"
										>
											<div className="text-3xl font-bold mb-2">
												{player.username
													.substring(0, 2)
													.toUpperCase()}
											</div>
											<div className="text-sm text-green-400">
												{player.username}
											</div>
											<div className="text-xs text-green-600 mt-1">
												CARD NO: ***
											</div>
										</div>
									))}
								</div>
							)}
						</RetroCard>

						<div className="text-center">
							<RetroButton
								onClick={
									joinInstructions.length > 0
										? handleApproveJoinRequests
										: handleStartGame
								}
								disabled={
									admittedPlayersCount < 2 &&
									joinInstructions.length < 2
								}
								variant="primary"
								className="text-2xl px-12 py-4"
							>
								{joinInstructions.length > 0
									? `ADMIT PLAYERS (${joinInstructions.length})`
									: admittedPlayersCount < 2
									? "WAITING FOR PLAYERS..."
									: `START GAME`}
							</RetroButton>
							{gameState.players.length < 2 && (
								<div className="text-sm text-green-600 mt-4">
									MINIMUM 2 PLAYERS REQUIRED
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};
