import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { RetroButton } from "../components/RetroButton";
import { RetroCard } from "../components/RetroCard";
import { GAMEPLAY_TIME } from "../lib/config";
import { Target, SkipForward, Clock, Crosshair } from "lucide-react";

export const PlayerGameplay: React.FC = () => {
	const playerId = localStorage.getItem("playerId");
	const { gameState, getPlayerById, submitAction } = useGame();
	const navigate = useNavigate();
	const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
	const [hiddenCardNumber, setHiddenCardNumber] = useState(true);
	const [actionSubmitted, setActionSubmitted] = useState(false);
	const [feedback, setFeedback] = useState("");
	const [countdown, setCountdown] = useState(GAMEPLAY_TIME);

	const player = playerId ? getPlayerById(playerId) : null;

	useEffect(() => {
		if (!player) {
			navigate("/");
			return;
		}

		if (gameState.gameStarted && !player.isAlive) {
			navigate("/shot");
			return;
		}

		if (!gameState.gameStarted) {
			navigate("/");
			return;
		}

		if (gameState.gameEnded && player.isAlive) {
			navigate("/victory");
			return;
		}
	}, [player, gameState, navigate]);

	useEffect(() => {
		if (gameState.roundInProgress && countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown, gameState.roundInProgress]);

	useEffect(() => {
		if (!gameState.roundInProgress) {
			setActionSubmitted(false);
			setSelectedTarget(null);
			setFeedback("");
			setCountdown(GAMEPLAY_TIME);
		}
	}, [gameState.roundInProgress, gameState.currentRound]);

	const handleShoot = () => {
		if (!selectedTarget || !playerId || actionSubmitted) return;

		submitAction(playerId, selectedTarget, false);
		setActionSubmitted(true);
		setFeedback("TARGET LOCKED");
	};

	const handleForgive = () => {
		if (!playerId || actionSubmitted) return;

		submitAction(playerId, null, true);
		setActionSubmitted(true);
		setFeedback("TURN SKIPPED [-1 POINT]");
	};

	const handleHideCardNumber = () => {
		setHiddenCardNumber(!hiddenCardNumber);
	};

	if (!player) {
		return null;
	}

	const otherPlayers = gameState.players.filter(
		(p) => p.id !== player.id && p.isAlive
	);

	return (
		<div className="min-h-screen bg-black text-green-500 p-6 font-mono">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<div className="text-sm text-green-600 mb-2">
						ROUND {gameState.currentRound}
					</div>
					<h1 className="text-4xl font-bold mb-2 tracking-wider">
						{player.username.toUpperCase()}
					</h1>
				</div>

				<RetroCard className="mb-6 text-center" glow>
					<div className="text-sm text-green-400 mb-2">
						YOUR CARD NUMBER
					</div>
					<div className="text-8xl font-bold my-6">
						{hiddenCardNumber ? "###" : player.cardNumber}
					</div>
					<div className="text-xs text-green-600">
						<button onClick={handleHideCardNumber}>
							&gt;{" "}
							{hiddenCardNumber
								? " REVEAL NUMBER "
								: " HIDE NUMBER "}{" "}
							&lt;
						</button>
					</div>
				</RetroCard>

				<div className="grid grid-cols-2 gap-4 mb-6">
					<RetroCard className="text-center">
						<Clock className="w-8 h-8 mx-auto mb-2" />
						<div className="text-xs text-green-400 mb-1">
							TIME LEFT
						</div>
						<div
							className={`text-4xl font-bold ${
								countdown <= 10
									? "text-red-500 retro-flicker"
									: ""
							}`}
						>
							{countdown}s
						</div>
					</RetroCard>

					<RetroCard className="text-center">
						<Crosshair className="w-8 h-8 mx-auto mb-2" />
						<div className="text-xs text-green-400 mb-1">
							PLAYERS ALIVE
						</div>
						<div className="text-4xl font-bold">
							{gameState.players.filter((p) => p.isAlive).length}
						</div>
					</RetroCard>
				</div>

				{!actionSubmitted ? (
					<>
						<RetroCard className="mb-6">
							<div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-green-500">
								<Target className="w-6 h-6" />
								<h2 className="text-xl uppercase">
									SELECT TARGET
								</h2>
							</div>

							<div className="space-y-3">
								{otherPlayers.map((p) => (
									<button
										key={p.id}
										onClick={() => setSelectedTarget(p.id)}
										className={`w-full border-2 p-4 text-left transition-all duration-200 ${
											selectedTarget === p.id
												? "border-green-400 bg-green-950"
												: "border-green-500 hover:border-green-400"
										}`}
									>
										<div className="flex justify-between items-center">
											<div>
												<div className="text-2xl font-bold">
													{p.username.toUpperCase()}
												</div>
												<div className="text-sm text-green-400">
													CARD #{p.cardNumber}
												</div>
											</div>
											{selectedTarget === p.id && (
												<div className="text-green-400 font-bold">
													SELECTED
												</div>
											)}
										</div>
									</button>
								))}
							</div>
						</RetroCard>

						<div className="space-y-4">
							<RetroButton
								onClick={handleShoot}
								disabled={!selectedTarget}
								variant="danger"
								className="w-full text-2xl py-4"
							>
								<div className="flex items-center justify-center gap-3">
									<Target className="w-6 h-6" />
									SHOOT PLAYER
								</div>
							</RetroButton>

							<RetroButton
								onClick={handleForgive}
								variant="secondary"
								className="w-full text-xl py-3"
							>
								<div className="flex items-center justify-center gap-3">
									<SkipForward className="w-5 h-5" />
									SKIP TURN [-1 POINT]
								</div>
							</RetroButton>
						</div>
					</>
				) : (
					<RetroCard className="text-center" glow>
						<div className="text-3xl font-bold mb-4">
							{feedback}
						</div>
						<div className="text-xl text-green-400 mb-6">
							ACTION CONFIRMED
						</div>
						<div className="text-sm text-green-600 animate-pulse">
							WAITING FOR OTHER PLAYERS...
						</div>
					</RetroCard>
				)}

				{countdown <= 10 && !actionSubmitted && (
					<div className="text-center mt-6">
						<div className="text-2xl font-bold text-red-500 retro-flicker animate-pulse">
							HURRY! TIME RUNNING OUT!
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
