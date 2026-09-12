// Splits a .sql file's content into individual statements, respecting
// single-quoted string literals and CREATE TRIGGER ... BEGIN ... END;
// bodies -- needed because D1's env.DB.exec() requires one statement per
// line and chokes on a full-file SQL dump (schema.sql has prose header
// comments, inline trailing comments on its column definitions,
// multi-line CREATE TABLE statements, and CREATE TRIGGER bodies whose
// internal semicolons are NOT statement boundaries; see setup.ts for why
// exec() isn't used directly).
//
// A naive "strip from -- to end of line" pass is NOT safe here: seed.sql
// has real data containing a literal "--" inside a string value --
// player_career_stats.scope_note stores a Wikipedia infobox's HTML
// comment verbatim, e.g. "<!-- LEAGUE MATCHES ONLY IN INFOBOX!-->".
// Blindly stripping from the first "--" would truncate that row's INSERT
// mid-string. This tracks whether we're inside a single-quoted string
// (SQL's own '' escape for a literal quote is handled the same way) and
// only treats -- as a comment start outside of one.
//
// Similarly, a naive "split on every ;" pass breaks schema.sql's CREATE
// TRIGGER blocks (each ends in `BEGIN ... ; ... ; END;` with genuine
// semicolons INSIDE the trigger body) into invalid fragments. This tracks
// a BEGIN/END nesting depth (matched as whole words, case-insensitively,
// outside strings/comments) and only treats `;` as a real statement
// terminator while that depth is 0.
const BEGIN_OR_END = /^(BEGIN|END)\b/i;

function isWordChar(ch: string | undefined): boolean {
	return ch !== undefined && /[A-Za-z0-9_]/.test(ch);
}

export function splitSqlStatements(sql: string): string[] {
	const statements: string[] = [];
	let current = "";
	let inString = false;
	let beginDepth = 0;

	for (let i = 0; i < sql.length; i++) {
		const ch = sql[i];

		if (inString) {
			current += ch;
			if (ch === "'") {
				if (sql[i + 1] === "'") {
					// Escaped literal quote ('') inside the string -- consume
					// both characters, string isn't actually closing here.
					current += "'";
					i++;
				} else {
					inString = false;
				}
			}
			continue;
		}

		if (ch === "'") {
			inString = true;
			current += ch;
			continue;
		}

		if (ch === "-" && sql[i + 1] === "-") {
			// Line comment (only recognized outside a string) -- drop
			// everything up to (not including) the newline.
			while (i < sql.length && sql[i] !== "\n") i++;
			continue;
		}

		// A whole-word BEGIN/END, not preceded by another word character
		// (so this doesn't fire mid-identifier, e.g. a column named
		// "append"). Only checked outside strings/comments, same as `;`
		// below -- a trigger body's own string literals or comments can't
		// accidentally close it early.
		if (!isWordChar(sql[i - 1])) {
			const match = BEGIN_OR_END.exec(sql.slice(i));
			if (match) {
				if (match[1].toUpperCase() === "BEGIN") beginDepth++;
				else if (beginDepth > 0) beginDepth--;
			}
		}

		if (ch === ";" && beginDepth === 0) {
			const statement = current.trim();
			if (statement) statements.push(statement);
			current = "";
			continue;
		}

		current += ch;
	}

	const last = current.trim();
	if (last) statements.push(last);
	return statements;
}
