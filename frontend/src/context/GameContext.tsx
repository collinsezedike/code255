import React, { createContext, useContext, useState, useCallback } from "react";
import { GAMECODE_MAX_LENGTH, GAMEPLAY_TIME } from "../utils";

export interface Player {
	id: string;
	username: string;
	cardNumber: number;
	isAlive: boolean;
}

export interface GameAction {
	playerId: string;
	targetId: string | null;
	skipped: boolean;
}

export interface RoundResult {
	playerId: string;
	targetId: string | null;
	wasShot: boolean;
	backfired: boolean;
	skipped: boolean;
}

interface GameState {
	gameCode: string;
	players: Player[];
	currentRound: number;
	gameStarted: boolean;
	roundInProgress: boolean;
	roundResults: RoundResult[];
	gameEnded: boolean;
	winner: Player | null;
	actions: Map<string, GameAction>;
	roundTimer: number;
}

interface GameContextType {
	gameState: GameState;
	generateGameCode: () => void;
	addPlayer: (username: string) => Player | null;
	startGame: () => void;
	submitAction: (
		playerId: string,
		targetId: string | null,
		skipped: boolean
	) => void;
	processRound: () => void;
	startNewGame: () => void;
	getPlayerById: (id: string) => Player | undefined;
	setRoundTimer: (time: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialState: GameState = {
	gameCode: "",
	players: [],
	currentRound: 0,
	gameStarted: false,
	roundInProgress: false,
	roundResults: [],
	gameEnded: false,
	winner: null,
	actions: new Map(),
	roundTimer: GAMEPLAY_TIME,
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [gameState, setGameState] = useState<GameState>(initialState);

	const generateGameCode = useCallback(() => {
		const code = (
			Math.floor(Math.random() * 9 * 10 ** (GAMECODE_MAX_LENGTH - 1)) +
			1 * 10 ** (GAMECODE_MAX_LENGTH - 1)
		).toString();
		setGameState((prev) => ({ ...prev, gameCode: code }));
	}, []);

	const addPlayer = useCallback(
		(username: string): Player | null => {
			if (gameState.gameStarted) return null;

			const newPlayer: Player = {
				id: Math.random().toString(36).substr(2, 9),
				username,
				cardNumber: Math.floor(Math.random() * 256),
				isAlive: true,
			};

			setGameState((prev) => ({
				...prev,
				players: [...prev.players, newPlayer],
			}));

			return newPlayer;
		},
		[gameState.gameStarted]
	);

	const startGame = useCallback(() => {
		if (gameState.players.length < 2) return;

		setGameState((prev) => ({
			...prev,
			gameStarted: true,
			currentRound: 1,
			roundInProgress: true,
			actions: new Map(),
			roundResults: [],
		}));
	}, [gameState.players.length]);

	const submitAction = useCallback(
		(playerId: string, targetId: string | null, skipped: boolean) => {
			setGameState((prev) => {
				const newActions = new Map(prev.actions);
				newActions.set(playerId, { playerId, targetId, skipped });
				return { ...prev, actions: newActions };
			});
		},
		[]
	);

	const processRound = useCallback(() => {
		setGameState((prev) => {
			const alivePlayers = prev.players.filter((p) => p.isAlive);
			const results: RoundResult[] = [];
			const shotsReceived = new Map<string, string[]>();
			const updatedPlayers = [...prev.players];

			alivePlayers.forEach((player) => {
				const action = prev.actions.get(player.id);
				if (action?.targetId) {
					if (!shotsReceived.has(action.targetId)) {
						shotsReceived.set(action.targetId, []);
					}
					shotsReceived.get(action.targetId)!.push(player.id);
				}
				if (action?.skipped) {
					const playerIndex = updatedPlayers.findIndex(
						(p) => p.id === player.id
					);
					if (playerIndex !== -1) {
						updatedPlayers[playerIndex].cardNumber = Math.max(
							0,
							updatedPlayers[playerIndex].cardNumber - 1
						);
					}
				}
			});

			alivePlayers.forEach((player) => {
				const action = prev.actions.get(player.id);
				const shotsAtMe = shotsReceived.get(player.id) || [];
				const wasShot = shotsAtMe.length > 0;
				let backfired = false;

				if (wasShot && action?.targetId) {
					backfired = shotsAtMe.includes(action.targetId);
				}

				if (wasShot && !backfired) {
					const playerIndex = updatedPlayers.findIndex(
						(p) => p.id === player.id
					);
					if (playerIndex !== -1) {
						updatedPlayers[playerIndex].isAlive = false;
					}
				}

				results.push({
					playerId: player.id,
					targetId: action?.targetId || null,
					wasShot,
					backfired,
					skipped: action?.skipped || false,
				});
			});

			const stillAlive = updatedPlayers.filter((p) => p.isAlive);
			const gameEnded = stillAlive.length <= 1;
			const winner = gameEnded ? stillAlive[0] || null : null;

			return {
				...prev,
				players: updatedPlayers,
				roundResults: results,
				roundInProgress: false,
				gameEnded,
				winner,
				actions: new Map(),
			};
		});
	}, []);

	const startNewGame = useCallback(() => {
		setGameState(initialState);
	}, []);

	const getPlayerById = useCallback(
		(id: string) => {
			return gameState.players.find((p) => p.id === id);
		},
		[gameState.players]
	);

	const setRoundTimer = useCallback((time: number) => {
		setGameState((prev) => ({ ...prev, roundTimer: time }));
	}, []);

	const value: GameContextType = {
		gameState,
		generateGameCode,
		addPlayer,
		startGame,
		submitAction,
		processRound,
		startNewGame,
		getPlayerById,
		setRoundTimer,
	};

	return (
		<GameContext.Provider value={value}>{children}</GameContext.Provider>
	);
};

export const useGame = () => {
	const context = useContext(GameContext);
	if (context === undefined) {
		throw new Error("useGame must be used within a GameProvider");
	}
	return context;
};
