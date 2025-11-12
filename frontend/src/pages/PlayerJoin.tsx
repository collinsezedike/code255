import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal } from "lucide-react";
import { RetroButton } from "../components/RetroButton";
import { RetroCard } from "../components/RetroCard";
import { GAMECODE_MAX_LENGTH, NICKNAME_MAX_LENGTH } from "../lib/config";
import { fetchGameAccountData, joinGame } from "../lib/program_instructions";
import { AdminSocketResponse } from "../lib/types";
import { createSocket } from "../lib/socket";

export const PlayerJoin: React.FC = () => {
	const [formattedCode, setFormattedCode] = useState("");
	const [gameCode, setGameCode] = useState("");
	const [username, setNickname] = useState("");
	const [error, setError] = useState("");
	const [isJoining, setIsJoining] = useState(false);
	const navigate = useNavigate();

	const handleGameCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = e.target.value;
		const cleanedNumber = rawValue.replace(/\D/g, "");
		const finalCode = cleanedNumber.slice(0, GAMECODE_MAX_LENGTH);
		const visuallyFormattedCode =
			finalCode.match(/.{1,4}/g)?.join("-") || "";

		setFormattedCode(visuallyFormattedCode);
		setGameCode(finalCode);
	};

	const handleJoinGame = async () => {
		setError("");

		if (!gameCode.trim() || gameCode.length !== GAMECODE_MAX_LENGTH) {
			setError("INVALID GAME CODE");
			return;
		}

		if (!username.trim() || username.length < 3) {
			setError("USERNAME TOO SHORT");
			return;
		}

		setIsJoining(true);

		const gameAccountData = await fetchGameAccountData(gameCode);

		if (!gameAccountData) {
			setError("GAME CODE NOT FOUND");
			setIsJoining(false);
			return;
		}

		const tx = await joinGame(
			username,
			gameAccountData.address,
			gameAccountData.admin
		);

		const socket = createSocket("player", username);

		socket.connect();

		// Wait up to 5 seconds, checking every 50ms
		for (let i = 0; i < 100; i++) {
			if (socket.isConnected) break;
			await new Promise((resolve) => setTimeout(resolve, 50));
		}

		if (!socket.isConnected) {
			setError("ERROR WHILE ESTABLISHING CONNECTION");
			setIsJoining(false);
			return;
		}

		// Send the txHash to the admin to sign
		socket.send({
			role: "player",
			sender: username,
			recipient: "admin",
			type: "player_message",
			content: Buffer.from(tx.serialize()).toString("base64"),
		});

		socket.onMessage((msg) => {
			console.log(msg);
			if (
				msg.sender == "admin" &&
				msg.content == AdminSocketResponse.ROUND_STARTED
			) {
				navigate("/gameplay");
			}
		});
	};

	if (isJoining) {
		return (
			<div className="min-h-screen bg-black text-green-500 flex items-center justify-center p-8 font-mono">
				<RetroCard className="text-center max-w-2xl w-full" glow>
					<Terminal className="w-16 h-16 mx-auto mb-6 animate-pulse" />
					<div className="text-3xl font-bold mb-4">CONNECTING...</div>
					<div className="text-xl text-green-400 mb-6">
						ESTABLISHING SECURE LINK
					</div>
					<div className="text-sm text-green-600">
						<div className="mb-2">
							&gt; VALIDATING CREDENTIALS...
						</div>
						<div className="mb-2">
							&gt; ALLOCATING CARD NUMBER...
						</div>
						<div className="mb-2">
							&gt; SYNCHRONIZING WITH HOST...
						</div>
						<div className="animate-pulse">
							&gt; CONNECTION ESTABLISHED_
						</div>
					</div>
				</RetroCard>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black text-green-500 flex items-center justify-center p-8 font-mono">
			<div className="max-w-2xl w-full">
				<div className="text-center mb-12">
					<h1 className="text-6xl font-bold mb-4 tracking-wider retro-flicker">
						CODE 255
					</h1>
					<div className="text-2xl text-green-400">
						PLAYER TERMINAL
					</div>
					<div className="text-sm text-green-600 mt-2">
						[AUTHENTICATION REQUIRED]
					</div>
				</div>

				<RetroCard glow>
					<div className="mb-8">
						<Terminal className="w-12 h-12 mb-4" />
						<h2 className="text-3xl font-bold uppercase mb-2">
							JOIN GAME
						</h2>
						<div className="text-sm text-green-600">
							ENTER YOUR CREDENTIALS TO PROCEED
						</div>
					</div>

					<div className="space-y-6">
						<div>
							<label className="block text-sm mb-2 uppercase tracking-wider">
								&gt; GAME CODE
							</label>
							<input
								type="text"
								value={formattedCode}
								onChange={handleGameCodeChange}
								placeholder="####-####"
								maxLength={GAMECODE_MAX_LENGTH + 1}
								className="w-full bg-black border-2 border-green-500 text-green-500 text-3xl font-mono px-4 py-3 focus:outline-none focus:border-green-400 tracking-widest text-center"
							/>
						</div>

						<div>
							<label className="block text-sm mb-2 uppercase tracking-wider">
								&gt; USERNAME
							</label>
							<input
								type="text"
								value={username}
								onChange={(e) =>
									setNickname(
										e.target.value.slice(
											0,
											NICKNAME_MAX_LENGTH
										)
									)
								}
								placeholder="ENTER NAME"
								maxLength={NICKNAME_MAX_LENGTH}
								className="w-full bg-black border-2 border-green-500 text-green-500 text-2xl font-mono px-4 py-3 focus:outline-none focus:border-green-400 uppercase text-center"
							/>
						</div>

						{error && (
							<div className="border-2 border-red-500 bg-red-950 p-4 text-center">
								<div className="text-red-500 font-bold retro-flicker">
									&gt; ERROR: {error}
								</div>
							</div>
						)}

						<RetroButton
							onClick={handleJoinGame}
							variant="primary"
							className="w-full text-2xl py-4"
						>
							CONNECT TO GAME
						</RetroButton>
					</div>
				</RetroCard>

				<div className="mt-8 text-sm text-green-600">
					<RetroCard>
						<h3 className="text-xl font-bold mb-4 uppercase border-b-2 border-green-500 pb-3">
							&gt; GAME RULES
						</h3>

						<div className="space-y-2 text-sm text-green-400">
							<div>
								&gt; At the start of each round, you shall
								receive a random card number (1..N).
							</div>

							<div>
								&gt; Each round, you must either shoot another
								player or forgive.
							</div>

							<div>
								&gt; Choosing to forgive reduces your card
								number by 1.
							</div>

							<div>
								&gt; When you shoot,
								<div className="ml-4">
									&gt; If{" "}
									<strong>
										your card number &gt;= target card
										number,
									</strong>{" "}
									target is shot and eliminated.
								</div>
								<div className="ml-4">
									&gt; Otherwise, the shot backfires and you
									are eliminated.
								</div>
							</div>

							<div>
								&gt; If two players shoot each other, outcomes
								are resolved independently.
							</div>

							<div>&gt; Last player standing wins.</div>
						</div>
					</RetroCard>
				</div>
			</div>
		</div>
	);
};
