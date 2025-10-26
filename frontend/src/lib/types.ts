export interface SocketMessage {
	role: "admin" | "player";
	type: "register" | "player_message" | "admin_message";
	sender: string;
	recipient: string;
	content: string;
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
