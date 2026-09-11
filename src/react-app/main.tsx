import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Ticker } from "./components/Ticker.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		{/* Outside App itself so it shows above every screen App picks
		    (home, single-player, multiplayer, ...) without that
		    screen-picking logic needing to know or care it exists. */}
		<Ticker />
		<App />
	</StrictMode>,
);
