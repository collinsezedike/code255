import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { RetroCard } from "../components/RetroCard";
import { Timer, Target, Shield } from "lucide-react";
import { GAMEPLAY_TIME } from "../utils";

export const AdminRound: React.FC = () => {
	const { gameState, processRound } = useGame();
	const navigate = useNavigate();
	const [countdown, setCountdown] = useState(GAMEPLAY_TIME);
	const [showResults, setShowResults] = useState(false);

	useEffect(() => {
		if (!gameState.gameStarted) {
			navigate("/admin");
			return;
		}

		if (gameState.gameEnded) {
			navigate("/admin/finale");
			return;
		}
	}, [gameState.gameStarted, gameState.gameEnded, navigate]);

	useEffect(() => {
		if (gameState.roundInProgress && countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}

		if (countdown === 0 && gameState.roundInProgress) {
			processRound();
			setShowResults(true);
		}
	}, [countdown, gameState.roundInProgress, processRound]);

	useEffect(() => {
		if (!gameState.roundInProgress && showResults) {
			const timer = setTimeout(() => {
				if (!gameState.gameEnded) {
					setShowResults(false);
					setCountdown(GAMEPLAY_TIME);
					navigate("/admin/round");
					window.location.reload();
				}
			}, 8000);
			return () => clearTimeout(timer);
		}
	}, [gameState.roundInProgress, showResults, gameState.gameEnded, navigate]);

	const alivePlayers = gameState.players.filter((p) => p.isAlive);
	const deadPlayers = gameState.players.filter((p) => !p.isAlive);
	const actionsSubmitted = gameState.actions.size;

	if (!gameState.roundInProgress && showResults) {
		return (
			<div className="min-h-screen bg-black text-green-500 p-8 font-mono">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-12">
						<h1 className="text-5xl font-bold mb-4 tracking-wider">
							ROUND {gameState.currentRound}
						</h1>
						<div className="text-3xl text-red-500 retro-flicker">
							RESULTS
						</div>
					</div>

					<RetroCard className="mb-8" glow>
						<h2 className="text-2xl mb-6 text-center uppercase border-b-2 border-green-500 pb-4">
							COMBAT RESOLUTION
						</h2>

						<div className="space-y-4">
							{gameState.roundResults.map((result) => {
								const player = gameState.players.find(
									(p) => p.id === result.playerId
								);
								const target = result.targetId
									? gameState.players.find(
											(p) => p.id === result.targetId
									  )
									: null;

								if (!player) return null;

								let status = "";
								let statusColor = "text-green-500";

								if (result.skipped) {
									status = "SKIPPED [-1 POINT]";
									statusColor = "text-yellow-500";
								} else if (result.backfired) {
									status = "BACKFIRED - SURVIVED";
									statusColor = "text-blue-500";
								} else if (result.wasShot) {
									status = "ELIMINATED";
									statusColor = "text-red-500";
								} else if (result.targetId) {
									status = `SHOT ${target?.nickname.toUpperCase()}`;
									statusColor = "text-orange-500";
								} else {
									status = "SURVIVED";
									statusColor = "text-green-500";
								}

								return (
									<div
										key={player.id}
										className="border border-green-500 p-4 slide-in"
									>
										<div className="flex justify-between items-center">
											<div>
												<span className="text-xl font-bold">
													{player.nickname.toUpperCase()}
												</span>
												<span className="text-sm text-green-600 ml-3">
													CARD #{player.cardNumber}
												</span>
											</div>
											<div
												className={`text-xl font-bold ${statusColor}`}
											>
												{status}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</RetroCard>

					<RetroCard>
						<div className="text-center">
							<div className="text-2xl mb-4">
								PLAYERS REMAINING: {alivePlayers.length}
							</div>
							{!gameState.gameEnded && (
								<div className="text-green-400 animate-pulse">
									NEXT ROUND STARTING...
								</div>
							)}
						</div>
					</RetroCard>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black text-green-500 p-8 font-mono">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-5xl font-bold mb-4 tracking-wider">
						CODE 255
					</h1>
					<div className="text-3xl text-green-400">
						ROUND {gameState.currentRound}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<RetroCard className="text-center" glow={countdown <= 10}>
						<Timer className="w-12 h-12 mx-auto mb-3" />
						<div className="text-sm text-green-400 mb-2">
							TIME REMAINING
						</div>
						<div
							className={`text-5xl font-bold ${
								countdown <= 10
									? "text-red-500 retro-flicker"
									: ""
							}`}
						>
							{countdown}s
						</div>
					</RetroCard>

					<RetroCard className="text-center">
						<Shield className="w-12 h-12 mx-auto mb-3" />
						<div className="text-sm text-green-400 mb-2">ALIVE</div>
						<div className="text-5xl font-bold">
							{alivePlayers.length}
						</div>
					</RetroCard>

					<RetroCard className="text-center">
						<Target className="w-12 h-12 mx-auto mb-3" />
						<div className="text-sm text-green-400 mb-2">
							ACTIONS SUBMITTED
						</div>
						<div className="text-5xl font-bold">
							{actionsSubmitted}/{alivePlayers.length}
						</div>
					</RetroCard>
				</div>

				<RetroCard className="mb-8">
					<h2 className="text-2xl mb-6 uppercase border-b-2 border-green-500 pb-4">
						ACTIVE PLAYERS
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{alivePlayers.map((player) => {
							const hasSubmitted = gameState.actions.has(
								player.id
							);
							return (
								<div
									key={player.id}
									className={`border-2 p-4 text-center ${
										hasSubmitted
											? "border-green-500 bg-green-950"
											: "border-green-700"
									}`}
								>
									<div className="text-2xl font-bold mb-2">
										{player.nickname.toUpperCase()}
									</div>
									<div className="text-sm text-green-400">
										CARD #{player.cardNumber}
									</div>
									{hasSubmitted && (
										<div className="text-xs text-green-500 mt-2 font-bold">
											ACTION LOCKED
										</div>
									)}
								</div>
							);
						})}
					</div>
				</RetroCard>

				{deadPlayers.length > 0 && (
					<RetroCard>
						<h2 className="text-xl mb-4 uppercase text-red-500 border-b-2 border-red-500 pb-3">
							ELIMINATED PLAYERS
						</h2>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50">
							{deadPlayers.map((player) => (
								<div
									key={player.id}
									className="border border-red-500 p-4 text-center text-red-500"
								>
									<div className="text-xl font-bold">
										{player.nickname.toUpperCase()}
									</div>
									<div className="text-xs mt-1">
										CARD #{player.cardNumber}
									</div>
								</div>
							))}
						</div>
					</RetroCard>
				)}

				{countdown <= 10 && (
					<div className="text-center mt-8">
						<div className="text-4xl font-bold text-red-500 retro-flicker animate-pulse">
							SHOOTING PHASE IMMINENT
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
