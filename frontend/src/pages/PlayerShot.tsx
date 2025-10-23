import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { RetroCard } from "../components/RetroCard";
import { Skull } from "lucide-react";

export const PlayerShot: React.FC = () => {
	const playerId = localStorage.getItem("playerId");
	const { gameState, getPlayerById } = useGame();
	const navigate = useNavigate();

	const player = playerId ? getPlayerById(playerId) : null;

	useEffect(() => {
		if (!player) {
			navigate("/");
			return;
		}

		if (player.isAlive) {
			navigate("/gameplay");
			return;
		}
	}, [player, navigate]);

	if (!player) {
		return null;
	}

	return (
		<div className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
			<div className="max-w-3xl w-full">
				<RetroCard className="text-center border-red-500" glow>
					<Skull className="w-32 h-32 mx-auto mb-8 text-red-500 retro-flicker" />

					<div className="text-7xl font-bold mb-6 retro-flicker tracking-wider">
						YOU'VE BEEN
					</div>
					<div className="text-9xl font-bold mb-8 retro-flicker tracking-wider">
						SHOT
					</div>

					<div className="border-t-2 border-red-500 pt-8 mt-8">
						<div className="text-2xl text-green-500 mb-4">
							FINAL STATS
						</div>
						<div className="text-xl text-green-400 mb-2">
							{player.nickname.toUpperCase()}
						</div>
						<div className="text-lg text-green-600 mb-2">
							CARD #{player.cardNumber}
						</div>
					</div>

					<div className="mt-8 text-green-600 text-sm">
						<div className="mb-2">
							&gt; ELIMINATED IN ROUND {gameState.currentRound}
						</div>
						<div className="animate-pulse">
							&gt; SPECTATING REMAINING PLAYERS...
						</div>
					</div>
				</RetroCard>
			</div>
		</div>
	);
};
