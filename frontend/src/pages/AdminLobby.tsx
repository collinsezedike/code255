import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useGame } from "../context/GameContext";
import { Users } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { RetroButton } from "../components/RetroButton";
import { RetroCard } from "../components/RetroCard";
import { AdminSocketResponse } from "../lib/types";
import {
	fetchAllPlayerAccounts,
	fetchGameAccountData,
	processJoinGameInstructions,
	startRound,
} from "../lib/program_instructions";

export const AdminLobby: React.FC = () => {
	const navigate = useNavigate();
	const { state } = useLocation();
	const { setVisible } = useWalletModal();
	const { wallet, signTransaction } = useWallet();
	const { connection } = useConnection();
	const { gameState } = useGame();
	const { isSocketConnected, socketConnect, socketMessages, socketSend } =
		useSocket();

	const [error, setError] = useState("");
	const [players, setPlayers] = useState<{ username: string }[]>([]);
	const [admittedPlayersCount, setAdmittedPlayersCount] = useState(0);
	const [joinRequests, setJoinRequests] = useState<
		{ username: string; tx: string }[]
	>([]);
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
			const gameAccount = await fetchGameAccountData(state.gameCode);
			if (!gameAccount) navigate("/admin");
			else setGameAccountData(gameAccount);
		};

		if (!state || !state.gameCode) {
			navigate("/admin");
			return;
		} else fetchData();
	}, [state, navigate]);

	useEffect(() => {
		if (!isSocketConnected) socketConnect("admin", state.gameCode);
	}, [isSocketConnected, socketConnect]);

	useEffect(() => {
		if (socketMessages.length === 0) return;

		const latestMessage = socketMessages[socketMessages.length - 1];

		if (latestMessage.recipient === state.gameCode) {
			setJoinRequests((prev) => [
				...prev,
				{ username: latestMessage.sender, tx: latestMessage.content }, // Note: You need the actual TX hash here, likely in content
			]);
			setPlayers((prev) => [...prev, { username: latestMessage.sender }]);
		}
	}, [socketMessages]);

	const formatGameCode = (code: string) => {
		if (!code) return "####-####";
		const cleaned = String(code).replace(/[^a-zA-Z0-9]/g, "");
		return cleaned.match(/.{1,4}/g)?.join("-") || "";
	};

	const handleApproveJoinRequests = async () => {
		if (!gameAccountData) return navigate("/admin");

		if (joinRequests.length === 0) return;

		if (!wallet?.adapter.publicKey) {
			setVisible(true);
			return;
		}

		if (!signTransaction) {
			setError("WALLET DOES NOT SUPPORT SIGNING TRANSACTIONS");
			return;
		}

		// Check if wallet address matches the game owner address
		if (
			gameAccountData.admin.toString() !=
			wallet.adapter.publicKey.toString()
		) {
			setError("INVALID ADMIN WALLET");
			return;
		}

		const tx = await processJoinGameInstructions(
			wallet.adapter.publicKey,
			joinRequests.map((req) => req.tx)
		);

		const signedTx = await signTransaction(tx);
		const signature = await connection.sendRawTransaction(
			signedTx.serialize()
		);
		const confirmedTx = await connection.getTransaction(signature, {
			commitment: "confirmed",
			maxSupportedTransactionVersion: 0,
		});
		if (confirmedTx && confirmedTx.meta && confirmedTx.meta.err) {
			setError(`TRANSACTION FAILED ${confirmedTx.meta.err}`);
			return;
		}

		joinRequests.forEach((req) => {
			socketSend({
				content: AdminSocketResponse.ADMITTED,
				recipient: req.username,
				role: "admin",
				sender: state.gameCode,
				type: "admin_message",
			});
		});

		setAdmittedPlayersCount(admittedPlayersCount + joinRequests.length);
		setJoinRequests([]); // Empty the array
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

		// 1. Fetch players accounts
		const playerAccounts = await fetchAllPlayerAccounts();

		// 2. Update round seed & 3. Start round
		const tx = await startRound(
			playerAccounts.map((p) => p.publicKey),
			gameAccountData.address,
			wallet.adapter.publicKey
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

		// 4. Broadcast to player accounts
		playerAccounts.forEach((p) => {
			socketSend({
				content: AdminSocketResponse.ROUND_STARTED,
				recipient: p.account.username,
				role: "admin",
				sender: state.gameCode,
				type: "admin_message",
			});
		});

		// 5. Navigate to next page
		navigate("/admin/round", { state });
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
									ADMITTED PLAYERS [{admittedPlayersCount}]
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
									joinRequests.length > 0
										? handleApproveJoinRequests
										: handleStartGame
								}
								disabled={
									admittedPlayersCount < 2 &&
									joinRequests.length < 2
								}
								variant="primary"
								className="text-2xl px-12 py-4"
							>
								{joinRequests.length > 0
									? `ADMIT PLAYERS (${joinRequests.length})`
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
