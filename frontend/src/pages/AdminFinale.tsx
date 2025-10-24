import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { RetroButton } from "../components/RetroButton";
import { RetroCard } from "../components/RetroCard";
import { Trophy } from "lucide-react";

export const AdminFinale: React.FC = () => {
	const { gameState, startNewGame } = useGame();
	const navigate = useNavigate();

	useEffect(() => {
		if (!gameState.gameEnded) {
			navigate("/admin");
		}
	}, [gameState.gameEnded, navigate]);

	const handleStartNewGame = () => {
		startNewGame();
		navigate("/admin");
	};

	const winner = gameState.winner;
	const allPlayers = [...gameState.players].sort((a, b) => {
		if (a.isAlive && !b.isAlive) return -1;
		if (!a.isAlive && b.isAlive) return 1;
		return b.cardNumber - a.cardNumber;
	});

	return (
		<div className="min-h-screen bg-black text-green-500 p-8 font-mono">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-6xl font-bold mb-4 tracking-wider retro-flicker">
						GAME OVER
					</h1>
					<div className="text-2xl text-green-400">FINAL RESULTS</div>
					<div className="text-sm text-green-600 mt-2">
						[TOTAL ROUNDS: {gameState.currentRound}]
					</div>
				</div>

				{winner && (
					<RetroCard className="mb-12 text-center" glow>
						<Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-500" />
						<div className="text-xl text-green-400 mb-2">
							VICTOR
						</div>
						<div className="text-7xl font-bold mb-4 retro-flicker">
							{winner.username.toUpperCase()}
						</div>
						<div className="text-3xl text-green-400">
							CARD #{winner.cardNumber}
						</div>
					</RetroCard>
				)}

				<RetroCard className="mb-8">
					<h2 className="text-2xl mb-6 uppercase border-b-2 border-green-500 pb-4 text-center">
						FINAL STANDINGS
					</h2>
					<div className="space-y-3">
						{allPlayers.map((player, index) => (
							<div
								key={player.id}
								className={`border-2 p-4 flex justify-between items-center ${
									player.isAlive
										? "border-green-500"
										: "border-red-500 opacity-60"
								}`}
							>
								<div className="flex items-center gap-4">
									<div className="text-3xl font-bold w-12">
										#{index + 1}
									</div>
									<div>
										<div className="text-2xl font-bold">
											{player.username.toUpperCase()}
										</div>
										<div className="text-sm text-green-400">
											CARD #{player.cardNumber}
										</div>
									</div>
								</div>
								<div className="text-right">
									<div
										className={`text-sm font-bold ${
											player.isAlive
												? "text-green-500"
												: "text-red-500"
										}`}
									>
										{player.isAlive
											? "SURVIVOR"
											: "ELIMINATED"}
									</div>
								</div>
							</div>
						))}
					</div>
				</RetroCard>

				<div className="flex gap-6 justify-center">
					<RetroButton
						onClick={handleStartNewGame}
						variant="primary"
						className="text-xl px-8"
					>
						START A NEW GAME
					</RetroButton>
				</div>
			</div>
		</div>
	);
};
