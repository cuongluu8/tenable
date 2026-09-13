import { useState } from "react";

interface Props {
	error: string | null;
	onCreate: (hostName: string) => Promise<void>;
	onJoin: (code: string, name: string) => Promise<void>;
	onBack: () => void;
	// Set when this screen was reached via a shared WhatsApp join link
	// (see shareSession.ts/RemoteMultiplayer.tsx's own doc) -- skips
	// straight to the join form with the code already filled in, since the
	// whole point of that link is not making the recipient re-type a code
	// they were just handed.
	initialJoinCode?: string;
}

// Entry point for remote multiplayer -- host a new session, or join one
// with a code someone else shared. Neither action needs a whole separate
// screen (this one has all of two fields), so both live here as a small
// mode toggle rather than their own routes.
export function RemoteHome({ error, onCreate, onJoin, onBack, initialJoinCode }: Props) {
	const [mode, setMode] = useState<"choose" | "create" | "join">(initialJoinCode ? "join" : "choose");
	const [name, setName] = useState("");
	const [code, setCode] = useState(initialJoinCode ?? "");
	const [submitting, setSubmitting] = useState(false);

	async function handleCreate(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim() || submitting) return;
		setSubmitting(true);
		await onCreate(name.trim());
		setSubmitting(false);
	}

	async function handleJoin(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim() || !code.trim() || submitting) return;
		setSubmitting(true);
		await onJoin(code.trim(), name.trim());
		setSubmitting(false);
	}

	return (
		<div className="screen">
			<button type="button" className="back-link" onClick={onBack}>
				← Back
			</button>
			<h2>Remote play</h2>
			<p className="remote-subtitle">Race friends on their own devices -- name the player from their badge trail.</p>

			{error && <p className="remote-error">{error}</p>}

			{mode === "choose" && (
				<div className="mode-picker">
					<button type="button" className="mode-button" onClick={() => setMode("create")}>
						<strong>🎉 Host a game</strong>
						<span>Get a code to share with friends</span>
					</button>
					<button type="button" className="mode-button" onClick={() => setMode("join")}>
						<strong>🔗 Join a game</strong>
						<span>Enter a code someone shared with you</span>
					</button>
				</div>
			)}

			{mode === "create" && (
				<form className="remote-form" onSubmit={handleCreate}>
					<label className="remote-field">
						Your name
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							maxLength={24}
							autoFocus
							disabled={submitting}
						/>
					</label>
					<button type="submit" className="remote-primary-button" disabled={!name.trim() || submitting}>
						Create session
					</button>
					<button type="button" className="back-link" onClick={() => setMode("choose")}>
						← Back
					</button>
				</form>
			)}

			{mode === "join" && (
				<form className="remote-form" onSubmit={handleJoin}>
					<label className="remote-field">
						Session code
						<input
							type="text"
							value={code}
							onChange={(e) => setCode(e.target.value.toUpperCase())}
							maxLength={6}
							autoFocus={!initialJoinCode}
							disabled={submitting}
							className="remote-code-input"
						/>
					</label>
					<label className="remote-field">
						Your name
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							maxLength={24}
							autoFocus={Boolean(initialJoinCode)}
							disabled={submitting}
						/>
					</label>
					<button type="submit" className="remote-primary-button" disabled={!name.trim() || !code.trim() || submitting}>
						Join session
					</button>
					<button type="button" className="back-link" onClick={() => setMode("choose")}>
						← Back
					</button>
				</form>
			)}
		</div>
	);
}
