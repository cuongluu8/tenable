import { useEffect, useState } from "react";
import "./ticker.css";

interface TickerResponse {
	message: string;
}

// A scrolling banner across the very top of every screen -- mounted once
// in main.tsx, outside App.tsx's own screen-picking logic entirely, so it
// shows regardless of which screen is active without that logic needing
// to know or care it exists. The message itself is entirely server-side
// (TICKER_MESSAGE in wrangler.json -- see that file's own comment on
// changing it live vs. redeploying) so it can be swapped -- a birthday
// shout-out today, something else tomorrow -- without touching this
// component. Fetched once per page load; an empty/missing message means
// no banner at all rather than an empty scrolling bar.
export function Ticker() {
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		fetch("/api/ticker")
			.then((res) => res.json() as Promise<TickerResponse>)
			.then((data) => {
				if (!cancelled) setMessage(data.message || null);
			})
			.catch(() => {
				// No banner is a fine fallback -- this is decorative, not core
				// gameplay, not worth surfacing an error for.
			});
		return () => {
			cancelled = true;
		};
	}, []);

	if (!message) return null;

	return (
		<div className="ticker" aria-label={message}>
			<div className="ticker__track" aria-hidden="true">
				<span className="ticker__item">{message}</span>
				<span className="ticker__item">{message}</span>
			</div>
		</div>
	);
}
