// WhatsApp share for a finished "Who am I?" round -- same shape and same
// caveats as clubBadges/shareSet.ts. Plain text only: api.whatsapp.com's
// wa.me redirect corrupts astral-plane emoji into U+FFFD (confirmed
// 2026-09-08 -- WhatsApp's bug, not ours), so no medals/emoji here.
//
// The link goes to the mode itself, not a specific round -- questions are
// drawn at random per round, so there's no fixed challenge to reproduce
// the way a club-badges Set is. Whoever taps it gets a fresh 10.
export function buildTeammatesShareText(correct: number, total: number, points: number): string {
	const url = `${window.location.origin}/single-player/teammates`;
	return `I got ${correct}/${total} (${points} pts) on "Who am I?" — name the mystery player from their old teammates. Think you can beat me? ${url}`;
}

// wa.me only PRE-FILLS WhatsApp's compose box -- the person still picks a
// recipient and hits send themselves, same as any "share to..." button.
export function shareTeammatesViaWhatsApp(correct: number, total: number, points: number): void {
	const text = buildTeammatesShareText(correct, total, points);
	window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}
