// WhatsApp share for a remote-multiplayer session code -- same pattern as
// components/shareSet.ts (Club Run/Teammate Tell "Sets" sharing), kept as
// its own small file rather than routed through createSetSharer() there:
// that sharer is specifically shaped around a finished set's score
// (setId/setName/average), none of which exists for a still-forming
// lobby. wa.me only ever PRE-FILLS WhatsApp's own compose box with this
// text -- opening it is not the same as sending anything: the person who
// clicked still has to pick a recipient and hit send themselves, inside
// WhatsApp, same as any "share to..." button.
//
// Plain words, no emoji -- confirmed live (2026-09-08, see shareSet.ts's
// own doc) that api.whatsapp.com's own wa.me redirect corrupts any
// astral-plane character (most emoji) into the U+FFFD replacement
// character, WhatsApp's own doing, not this app's. Sidestepped entirely
// by not using any here, same fix already applied there.

// `?join=<code>` is read once by RemoteMultiplayer.tsx on load -- whoever
// opens this link lands straight in the "join" form with the code
// already filled in, not the game-type picker or a blank host-or-join
// choice, since the whole point of a shared link is skipping every step
// that isn't "type your name".
export function buildJoinUrl(sessionCode: string): string {
	return `${window.location.origin}/remote?join=${sessionCode}`;
}

export function shareSessionViaWhatsApp(sessionCode: string, gameLabel: string): void {
	const url = buildJoinUrl(sessionCode);
	const text = `Join my ${gameLabel} game on Top-10 Tension! Code: ${sessionCode} ${url}`;
	window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}
