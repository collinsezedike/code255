import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Terminal } from "lucide-react";
import { useGame } from "../context/GameContext";
import { useSocket } from "../context/SocketContext";
import { RetroButton } from "../components/RetroButton";
import { RetroCard } from "../components/RetroCard";
import { createGame } from "../lib/program_instructions";

export const AdminCreate: React.FC = () => {
	const { setVisible } = useWalletModal();
	const { wallet, signTransaction } = useWallet();
	const { socketConnect, isSocketConnected } = useSocket();
	const { generateGameCode, gameState } = useGame();
	const navigate = useNavigate();

	const [isCreating, setIsCreating] = useState(false);

	useEffect(() => {
		if (!isSocketConnected) {
			socketConnect("admin", "");
		}
	}, [isSocketConnected]);

	useEffect(() => {
		if (isSocketConnected && !gameState.gameCode) {
			generateGameCode();
		}
	}, [gameState.gameCode, generateGameCode]);

	const handleCreateGame = async () => {
		if (!wallet?.adapter.publicKey) {
			setVisible(true);
			return;
		}

		if (!signTransaction) {
			alert("Wallet does not support signing transactions!");
			return;
		}

		setIsCreating(true);
		generateGameCode();
		const txData = await createGame(
			gameState.gameCode,
			wallet.adapter.publicKey.toString()
		);
		const signedTx = await signTransaction(txData.txHash);
		await txData.connection.sendRawTransaction(signedTx.serialize());

		// setTimeout(() => {
		// 	setTimeout(() => {
		navigate("/admin/lobby");
		// 	}, 2000);
		// }, 1000);
	};

	if (isCreating) {
		return (
			<div className="min-h-screen bg-black text-green-500 flex items-center justify-center p-8 font-mono">
				<RetroCard className="text-center max-w-2xl w-full" glow>
					<Terminal className="w-16 h-16 mx-auto mb-6" />
					<div className="text-3xl font-bold mb-4">
						INITIALIZING GAME...
					</div>
					<div className="text-xl text-green-400 mb-6">
						CONFIGURING HOST SYSTEM
					</div>
					<div className="text-sm text-green-600">
						<div
							className="mb-2 animate-pulse"
							style={{ animationDelay: "0s" }}
						>
							&gt; GENERATING GAME CODE...
						</div>
						<div
							className="mb-2 animate-pulse"
							style={{ animationDelay: "0.3s" }}
						>
							&gt; PREPARING LOBBY INTERFACE...
						</div>
						<div
							className="mb-2 animate-pulse"
							style={{ animationDelay: "0.6s" }}
						>
							&gt; LOADING CONTROL CENTER...
						</div>
					</div>
				</RetroCard>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black text-green-500 p-8 font-mono">
			<div className="max-w-4xl mx-auto text-center space-y-12">
				<div>
					<h1 className="text-6xl font-bold mb-4 tracking-wider retro-flicker">
						CODE 255
					</h1>
					<div className="text-2xl text-green-400 mb-1">
						ADMIN ACCESS REQUIRED
					</div>
					<div className="text-sm text-green-700">
						[INITIATE GAME ENGINE]
					</div>
				</div>

				<RetroCard glow className="py-16">
					<div className="space-y-6">
						{!wallet && (
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
						)}

						{wallet && (
							<>
								<div className="text-2xl">WALLET CONNECTED</div>
								<RetroButton
									onClick={handleCreateGame}
									variant="primary"
									className="text-xl px-10 py-4"
								>
									CREATE A NEW GAME
								</RetroButton>
							</>
						)}
					</div>
				</RetroCard>
			</div>
		</div>
	);
};
