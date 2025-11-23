import React, {
	createContext,
	useCallback,
	useContext,
	useState,
	useRef,
} from "react";
import { createSocket } from "../lib/socket";
import type { SocketMessage } from "../lib/types";

interface SocketContextValue {
	socket: ReturnType<typeof createSocket> | null;
	isSocketConnected: boolean;
	socketMessages: SocketMessage[];
	socketConnect: (role: "admin" | "player", username: string) => void;
	socketSend: (msg: SocketMessage) => void;
}

const SocketContext = createContext<SocketContextValue>({
	socket: null,
	isSocketConnected: false,
	socketMessages: [],
	socketConnect: () => {},
	socketSend: () => {},
});

export const useSocket = () => {
	const ctx = useContext(SocketContext);
	if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
	return ctx;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
	const [socketMessages, setSocketMessages] = useState<SocketMessage[]>([]);
	const socketRef = useRef<ReturnType<typeof createSocket> | null>(null);

	const socketConnect = useCallback(
		(role: "admin" | "player", username: string) => {
			const client = createSocket(role, username);
			client.connect();
			socketRef.current = client;
			setIsSocketConnected(true);
			client.onMessage((msg) =>
				setSocketMessages((prev) => [...prev, msg])
			);
		},
		[]
	);

	const socketSend = useCallback((msg: SocketMessage) => {
		if (!socketRef.current) return;
		socketRef.current?.send(msg);
	}, []);

	return (
		<SocketContext.Provider
			value={{
				socket: socketRef.current,
				isSocketConnected: isSocketConnected,
				socketMessages: socketMessages,
				socketConnect: socketConnect,
				socketSend: socketSend,
			}}
		>
			{children}
		</SocketContext.Provider>
	);
};
