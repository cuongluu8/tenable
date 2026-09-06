import { Hono } from "hono";

const mediaAudit = new Hono<{ Bindings: Env }>();

// Unlisted admin page (no link to it anywhere in the app nav) for visually
// auditing every club/country's badge or flag: missing entities.image_key
// shows as a red "MISSING" tile, a set image_key renders the actual image
// so a wrong-club/wrong-country image is something a human can just look at
// and spot -- no script can tell "this is a real image" (see
// data/research/audit_media.sh for that check) from "this is the RIGHT
// image", only a person looking at it can.
//
// GET /api/admin/media-audit           -- clubs, missing-first
// GET /api/admin/media-audit?type=country
// GET /api/admin/media-audit?type=club&missing=1   -- only entities with no image_key
mediaAudit.get("/", async (c) => {
	const type = c.req.query("type") === "country" ? "country" : "club";
	const missingOnly = c.req.query("missing") === "1";

	const { results } = await c.env.DB.prepare(
		`SELECT id, canonical_name, scope, image_key FROM entities
		 WHERE entity_type = ?
		 ${missingOnly ? "AND image_key IS NULL" : ""}
		 ORDER BY (image_key IS NULL) DESC, canonical_name`,
	)
		.bind(type)
		.all<{ id: number; canonical_name: string; scope: string | null; image_key: string | null }>();

	const total = results.length;
	const missingCount = results.filter((r) => !r.image_key).length;

	const tiles = results
		.map((r) => {
			const body = r.image_key
				? `<img src="/api/media/${r.image_key}" alt="${escapeHtml(r.canonical_name)}" loading="lazy">`
				: `<div class="missing">MISSING</div>`;
			return `
				<div class="tile ${r.image_key ? "" : "tile--missing"}">
					${body}
					<div class="label">${escapeHtml(r.canonical_name)}</div>
					<div class="meta">#${r.id}${r.scope ? " · " + escapeHtml(r.scope) : ""}</div>
				</div>`;
		})
		.join("");

	const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Media audit</title>
<style>
	body { font-family: system-ui, sans-serif; background: #111; color: #eee; margin: 0; padding: 20px; }
	h1 { font-size: 18px; margin: 0 0 4px; }
	.summary { color: #aaa; margin-bottom: 16px; font-size: 14px; }
	.summary a { color: #6cf; margin-left: 10px; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
	.tile { background: #1c1c1c; border: 1px solid #333; border-radius: 8px; padding: 10px; text-align: center; }
	.tile--missing { border-color: #a33; background: #2a1414; }
	.tile img { max-width: 72px; max-height: 72px; object-fit: contain; background: #fff; border-radius: 4px; padding: 4px; }
	.missing { width: 72px; height: 72px; margin: 0 auto; display: flex; align-items: center; justify-content: center;
		background: #a33; color: #fff; font-size: 10px; font-weight: bold; border-radius: 4px; }
	.label { font-size: 12px; margin-top: 6px; word-break: break-word; }
	.meta { font-size: 10px; color: #888; margin-top: 2px; }
</style>
</head>
<body>
	<h1>Media audit — ${type === "club" ? "Clubs" : "Countries"}</h1>
	<div class="summary">
		${total} total, ${missingCount} missing image_key
		<a href="?type=club">Clubs</a>
		<a href="?type=country">Countries</a>
		<a href="?type=${type}&missing=1">Missing only</a>
		<a href="?type=${type}">All</a>
	</div>
	<div class="grid">${tiles}</div>
</body>
</html>`;

	return c.html(html);
});

function escapeHtml(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default mediaAudit;
