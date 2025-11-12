import { createSocket } from "./socket";

export interface TransferredState {
	gameCode: string,
	socket: ReturnType<typeof createSocket>
}

export interface SocketMessage {
	role: "admin" | "player";
	type: "register" | "player_message" | "admin_message";
	sender: string;
	recipient: string;
	content: string;
}

export enum AdminSocketResponse {
	ADMITTED = "Player has been admitted",
	ROUND_STARTED = "Round has started",
	ELIMINATED = "Player has been eliminated",
}

export interface Player {
	id: string;
	username: string;
	cardNumber: number;
	isAlive: boolean;
}

export interface PlayerAction {
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

export interface GameState {
	gameCode: string;
	gameAddress: string;
	adminAddress: string;
	players: Player[];
	currentRound: number;
	gameStarted: boolean;
	roundInProgress: boolean;
	roundResults: RoundResult[];
	gameEnded: boolean;
	winner: Player | null;
	actions: Map<string, PlayerAction>;
	roundTimer: number;
}
