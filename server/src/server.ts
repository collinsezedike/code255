import { WebSocketServer, WebSocket, RawData } from "ws";

interface Message {
	role: "admin" | "player";
	type: "register" | "player_message" | "admin_message";
	sender: string;
	recipient: string;
	content: string;
}

class GameServer {
	private server: WebSocketServer;
	private admin: WebSocket | null = null;
	private players = new Map<string, WebSocket>();

	constructor(port: number) {
		this.server = new WebSocketServer({ port });
		this.registerEvents();
		console.log(`WebSocket server running on ws://localhost:${port}`);
	}

	/** Register top-level server events */
	private registerEvents() {
		this.server.on("connection", (socket) => this.handleConnection(socket));
	}

	/** Handle new client connections */
	private handleConnection(socket: WebSocket) {
		console.log("New client connected");

		socket.on("message", (raw) => this.handleMessage(socket, raw));
		socket.on("close", () => this.handleDisconnection(socket));
	}

	/** Parse and route incoming messages */
	private handleMessage(socket: WebSocket, raw: RawData) {
		let msg: Message;

		try {
			msg = JSON.parse(raw.toString());
		} catch {
			console.warn("Invalid JSON message");
			return;
		}

		console.log("msg: ", msg);

		switch (msg.type) {
			case "register":
				this.handleRegister(socket, msg);
				break;
			case "player_message":
				this.handlePlayerMessage(msg);
				break;
			case "admin_message":
				this.handleAdminMessage(msg);
				break;
			default:
				console.warn(`Unknown message type: ${msg.type}`);
		}
	}

	/** Handle admin/player registration */
	private handleRegister(socket: WebSocket, msg: Message) {
		if (msg.role === "admin") {
			this.admin = socket;
		} else if (msg.role === "player" && msg.sender) {
			this.players.set(msg.sender, socket);
		}
	}

	/** Forward player message to admin */
	private handlePlayerMessage(msg: Message) {
		console.log("msg: ", msg);
		if (!this.admin || this.admin.readyState !== WebSocket.OPEN) return;

		this.send(this.admin, msg);
	}

	/** Forward admin message to a specific player */
	private handleAdminMessage(msg: Message) {
		if (!msg.recipient || !this.players.has(msg.recipient)) return;

		const playerSocket = this.players.get(msg.recipient)!;
		if (playerSocket.readyState === WebSocket.OPEN) {
			this.send(playerSocket, msg);
		}
	}

	/** Handle client disconnection */
	private handleDisconnection(socket: WebSocket) {
		if (socket === this.admin) {
			this.admin = null;
			console.log("Admin disconnected");
			return;
		}

		for (const [id, s] of this.players.entries()) {
			if (s === socket) {
				this.players.delete(id);
				console.log(`Player ${id} disconnected`);
				break;
			}
		}
	}

	/** Safely send JSON data */
	private send(socket: WebSocket, data: object) {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify(data));
		}
	}
}

// Start server
new GameServer(8080);
