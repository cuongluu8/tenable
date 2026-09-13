// Session code + token generation for remote multiplayer (see
// durableObjects/remoteGameSession.ts's own doc for the feature this
// belongs to). Kept as small, pure, directly unit-testable functions here
// rather than inline in the Durable Object itself.

// Deliberately excludes visually-ambiguous characters (0/O, 1/I/L) -- this
// code gets read off one phone screen and typed into another (or read
// aloud over a call), where a mistaken 0-for-O costs a whole failed join
// attempt. Because the real alphabet never contains any of the excluded
// characters, there's nothing for normalizeSessionCode (below) to
// disambiguate -- a stray O or 1 in what someone typed is simply not part
// of any real code, full stop, rather than a guess at which real
// character they meant. 32 characters ^ 6 positions ≈ 1.07 billion
// combinations -- comfortably enough to avoid an accidental collision
// between however many sessions are ever concurrently active in a casual
// party game, while staying short enough to read in one glance.
const SESSION_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const SESSION_CODE_LENGTH = 6;

export function generateSessionCode(): string {
	let code = "";
	for (let i = 0; i < SESSION_CODE_LENGTH; i++) {
		code += SESSION_CODE_ALPHABET[Math.floor(Math.random() * SESSION_CODE_ALPHABET.length)];
	}
	return code;
}

// What a person actually typed (from a shared link, or read aloud) needs
// normalizing before comparison against a stored code -- case and stray
// whitespace only (e.g. a WhatsApp-forwarded message line-wrapping "AB
// 12 XY"). Not a fuzzy/forgiving match the way guess normalization
// (normalize.ts) is -- a code containing a character outside
// SESSION_CODE_ALPHABET is simply wrong, not something to guess a
// correction for (see this file's own header on why the alphabet itself
// is what prevents ambiguity, not a correction step here).
export function normalizeSessionCode(input: string): string {
	return input.toUpperCase().replace(/\s+/g, "");
}

export function isValidSessionCode(code: string): boolean {
	return code.length === SESSION_CODE_LENGTH && [...code].every((ch) => SESSION_CODE_ALPHABET.includes(ch));
}

// Host/player auth tokens -- never typed or read by a person (stored in
// localStorage, sent back as-is on every request to prove "this is
// really the same host/player who did X earlier"), so there's no
// readability tradeoff here the way there is for the session code above:
// a real UUID's own entropy is exactly what this needs, nothing custom.
export function generateToken(): string {
	return crypto.randomUUID();
}
