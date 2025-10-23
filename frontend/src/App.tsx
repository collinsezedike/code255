import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import { ScanlineOverlay } from "./components/ScanlineOverlay";
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
			<Router>
				<ScanlineOverlay />
				<Routes>
					<Route path="/" element={<PlayerJoin />} />
					<Route path="/gameplay" element={<PlayerGameplay />} />
					<Route path="/shot" element={<PlayerShot />} />
					<Route path="/victory" element={<PlayerVictory />} />
					<Route path="/admin" element={<AdminLobby />} />
					<Route path="/admin/round" element={<AdminRound />} />
					<Route path="/admin/finale" element={<AdminFinale />} />
				</Routes>
			</Router>
		</GameProvider>
	);
}

export default App;
