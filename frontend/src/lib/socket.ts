import { WSS_URL } from "./config";
import type { SocketMessage } from "./types";

class SocketClient {
	private socket: WebSocket | null = null;
	private listeners: ((msg: SocketMessage) => void)[] = [];
	private role: "admin" | "player";
	private username: string;
	public isConnected: boolean;

	constructor(role: "admin" | "player", username: string) {
		this.role = role;
		this.username = username;
		this.isConnected = false;
	}

	connect(url = WSS_URL) {
		this.socket = new WebSocket(url);

		this.socket.addEventListener("open", () => {
			console.log(`${this.role} ${this.username} connected to webSocket`);
			this.isConnected = this.socket?.readyState == 1 ? true : false;

			this.send({
				role: this.role,
				type: "register",
				sender: this.username,
				recipient: "",
				content: "",
			});
		});

		this.socket.addEventListener("message", (event) => {
			try {
				const msg = JSON.parse(event.data);
				this.listeners.forEach((fn) => fn(msg));
			} catch (err) {
				console.warn("Invalid WebSocket message:", err);
			}
		});

		this.socket.addEventListener("close", () => {
			console.log("Disconnected from WebSocket");
		});
	}

	onMessage(callback: (msg: SocketMessage) => void) {
		this.listeners.push(callback);
	}

	send(msg: SocketMessage) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(msg));
		} else {
			console.warn("Socket not ready, message not sent");
		}
	}
}

export function createSocket(role: "admin" | "player", username: string) {
	return new SocketClient(role, username);
}
