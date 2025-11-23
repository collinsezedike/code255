import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import { SolanaProvider } from "./context/SolanaContext";
import { SocketProvider } from "./context/SocketContext";
import { ScanlineOverlay } from "./components/ScanlineOverlay";
import { AdminCreate } from "./pages/AdminCreate";
import { AdminLobby } from "./pages/AdminLobby";
import { AdminRound } from "./pages/AdminRound";
import { AdminFinale } from "./pages/AdminFinale";
import { PlayerJoin } from "./pages/PlayerJoin";
import { PlayerGameplay } from "./pages/PlayerGameplay";
import { PlayerShot } from "./pages/PlayerShot";
import { PlayerVictory } from "./pages/PlayerVictory";

function App() {
	return (
		<GameProvider>
			<SocketProvider>
				<SolanaProvider>
					<Router>
						<ScanlineOverlay />
						<Routes>
							<Route path="/" element={<PlayerJoin />} />
							<Route
								path="/gameplay"
								element={<PlayerGameplay />}
							/>
							<Route path="/shot" element={<PlayerShot />} />
							<Route
								path="/victory"
								element={<PlayerVictory />}
							/>
							<Route path="/admin" element={<AdminCreate />} />
							<Route
								path="/admin/lobby"
								element={<AdminLobby />}
							/>
							<Route
								path="/admin/round"
								element={<AdminRound />}
							/>
							<Route
								path="/admin/finale"
								element={<AdminFinale />}
							/>
						</Routes>
					</Router>
				</SolanaProvider>
			</SocketProvider>
		</GameProvider>
	);
}

export default App;
