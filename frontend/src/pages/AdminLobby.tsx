import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { RetroButton } from "../components/RetroButton";
import { RetroCard } from "../components/RetroCard";
import { Users } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSocket } from "../context/SocketContext";
import { fetchGameAccountData } from "../lib/program_instructions";

export const AdminLobby: React.FC = () => {
	const navigate = useNavigate();
	const { state } = useLocation();
	const { setVisible } = useWalletModal();
	const { wallet } = useWallet();
	const { gameState, startGame } = useGame();
	const {
		isSocketConnected,
		socket,
		socketConnect,
		socketMessages,
		socketSend,
	} = useSocket();

	useEffect(() => {
		const fetchData = async () => {
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait a while for the create game transaction to finalize
			const gameAccountData = await fetchGameAccountData(state.gameCode);
			if (!gameAccountData) navigate("/admin");
		};

		if (!state?.gameCode) navigate("/admin");
		else fetchData();
	}, []);

	useEffect(() => {
		if (!isSocketConnected) {
			socketConnect("admin", state.gameCode);
		}
	}, [isSocketConnected]);

	useEffect(() => {
		if (!socket) return;
		socket.onMessage((msg) => {
			console.log({ msg });
			socketSend({
				content: "Hello back",
				recipient: msg.sender,
				role: "admin",
				sender: "22334455",
				type: "admin_message",
			});
		});
	}, [socketMessages]);

	const formatGameCode = (code: string) => {
		if (!code) return "####-####";
		const cleaned = String(code).replace(/[^a-zA-Z0-9]/g, "");
		return cleaned.match(/.{1,4}/g)?.join("-") || "";
	};

	const handleStartGame = () => {
		if (gameState.players.length >= 2) {
			startGame();
		}
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
									CONNECTED PLAYERS [
									{gameState.players.length}]
								</h2>
							</div>

							{gameState.players.length === 0 ? (
								<div className="text-center py-12 text-green-600">
									<div className="text-xl mb-2">
										WAITING FOR PLAYERS
										<div className="animate-pulse">...</div>
									</div>
								</div>
							) : (
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									{gameState.players.map((player, index) => (
										<div
											key={player.id}
											className="border border-green-500 p-4 text-center slide-in"
											style={{
												animationDelay: `${
													index * 100
												}ms`,
											}}
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
												CARD #{player.cardNumber}
											</div>
										</div>
									))}
								</div>
							)}
						</RetroCard>

						<div className="text-center">
							<RetroButton
								onClick={handleStartGame}
								disabled={gameState.players.length < 2}
								variant="primary"
								className="text-2xl px-12 py-4"
							>
								{gameState.players.length < 2
									? "WAITING FOR PLAYERS..."
									: `START GAME [${gameState.players.length} PLAYERS]`}
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
