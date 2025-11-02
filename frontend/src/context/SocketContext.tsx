import React, { createContext, useContext, useState } from "react";
import { createSocket } from "../lib/socket";
import type { SocketMessage } from "../lib/types";

interface SocketContextValue {
	socket: ReturnType<typeof createSocket> | null;
	isSocketConnected: boolean;
	messages: SocketMessage[];
	socketConnect: (role: "admin" | "player", username: string) => void;
	send: (msg: SocketMessage) => void;
}

const SocketContext = createContext<SocketContextValue>({
	socket: null,
	isSocketConnected: false,
	messages: [],
	socketConnect: () => {},
	send: () => {},
});

export const useSocket = () => {
	const ctx = useContext(SocketContext);
	if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
	return ctx;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [socket, setSocket] = useState<ReturnType<
		typeof createSocket
	> | null>(null);
	const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
	const [messages, setMessages] = useState<SocketMessage[]>([]);

	const connect = (role: "admin" | "player", username: string) => {
		const client = createSocket(role, username);
		client.connect();
		setIsSocketConnected(true);
		client.onMessage((msg) => setMessages((prev) => [...prev, msg]));
		setSocket(client);
	};

	const send = (msg: SocketMessage) => {
		socket?.send(msg);
	};

	return (
		<SocketContext.Provider
			value={{
				socket,
				isSocketConnected: isSocketConnected,
				messages,
				socketConnect: connect,
				send,
			}}
		>
			{children}
		</SocketContext.Provider>
	);
};
