import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { RetroCard } from "../components/RetroCard";
import { Trophy, Star } from "lucide-react";

export const PlayerVictory: React.FC = () => {
	const playerId = localStorage.getItem("playerId");
	const { gameState, getPlayerById } = useGame();
	const navigate = useNavigate();

	const player = playerId ? getPlayerById(playerId) : null;

	useEffect(() => {
		if (!player) {
			navigate("/");
			return;
		}

		if (!gameState.gameEnded) {
			navigate("/gameplay");
			return;
		}

		if (!player.isAlive) {
			navigate("/shot");
			return;
		}
	}, [player, gameState, navigate]);

	if (!player) {
		return null;
	}

	return (
		<div className="min-h-screen bg-black text-green-500 flex items-center justify-center p-6 font-mono">
			<div className="max-w-3xl w-full">
				<RetroCard className="text-center" glow>
					<div className="flex justify-center gap-6 mb-8">
						<Star className="w-16 h-16 text-yellow-500 retro-flicker" />
						<Trophy className="w-24 h-24 text-yellow-500" />
						<Star className="w-16 h-16 text-yellow-500 retro-flicker" />
					</div>

					<div className="text-5xl font-bold mb-4 text-yellow-500 retro-flicker tracking-wider">
						CONGRATULATIONS
					</div>

					<div className="text-8xl font-bold mb-8 retro-flicker tracking-wider">
						VICTORY
					</div>

					<div className="text-3xl mb-8 text-green-400">
						YOU ARE THE LAST ONE STANDING
					</div>

					<div className="border-t-2 border-green-500 border-b-2 py-8 my-8">
						<div className="text-2xl mb-4">FINAL STATS</div>
						<div className="text-4xl font-bold mb-3">
							{player.username.toUpperCase()}
						</div>
						<div className="text-xl text-green-400 mb-2">
							CARD #{player.cardNumber}
						</div>
					</div>

					<div className="text-green-600 text-sm">
						<div className="mb-2">
							&gt; GAME COMPLETED IN {gameState.currentRound}{" "}
							ROUNDS
						</div>
						<div className="mb-2">
							&gt; TOTAL PLAYERS: {gameState.players.length}
						</div>
						<div className="animate-pulse">
							&gt; YOU ARE THE CHAMPION_
						</div>
					</div>
				</RetroCard>
			</div>
		</div>
	);
};
