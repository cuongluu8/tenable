import { Hono } from "hono";

const mediaAudit = new Hono<{ Bindings: Env }>();

// Unlisted admin page (no link to it anywhere in the app nav) for visually
// auditing every club/country's badge or flag. Three states a tile can be
// in, visually distinct on purpose (a human glancing at a grid of ~600
// tiles needs to tell these apart at a glance, not by reading each label):
//   - MISSING (red)   -- entities.image_key is NULL, nothing was ever sourced
//   - BROKEN (orange) -- image_key is set but the actual image failed to
//     load in the browser (stale R2 key, corrupt object, sourced-but-broken
//     upload -- see data/research/media_needs_reupload.csv for known cases)
//   - a real image     -- image_key set and it actually loaded
// wrangler.json's r2_buckets MEDIA binding has "remote": true specifically
// so this page (and the game itself) sees real uploaded images in local dev
// too, not an empty local R2 emulation -- D1 stays local (no such flag on
// d1_databases), so this doesn't touch the D1 free-tier quota at all.
// No script can tell "this is a real image" from "this is the RIGHT image
// for this entity" (a wrong-club crest still loads fine) -- only a person
// looking at the grid can catch that; the point of this page is to make
// that fast, not to replace it.
//
// GET /api/admin/media-audit                       -- clubs, grouped by country
// GET /api/admin/media-audit?type=country          -- countries, grouped by confederation
// GET /api/admin/media-audit?type=club&missing=1   -- only entities with no image_key
// GET /api/admin/media-audit?type=club&flat=1      -- ungrouped, missing-first (the old default)
// There's no dedicated "league" column in the schema -- entities.scope (a
// club's country / a country's confederation) is the closest real grouping
// the data actually has, so that's what "grouped by" means here.
mediaAudit.get("/", async (c) => {
	const type = c.req.query("type") === "country" ? "country" : "club";
	const missingOnly = c.req.query("missing") === "1";
	const flat = c.req.query("flat") === "1";
	const groupLabel = type === "club" ? "Country" : "Confederation";

	const { results } = await c.env.DB.prepare(
		`SELECT id, canonical_name, scope, image_key FROM entities
		 WHERE entity_type = ?
		 ${missingOnly ? "AND image_key IS NULL" : ""}
		 ORDER BY ${flat ? "(image_key IS NULL) DESC, canonical_name" : "scope IS NULL, scope, canonical_name"}`,
	)
		.bind(type)
		.all<{ id: number; canonical_name: string; scope: string | null; image_key: string | null }>();

	const total = results.length;
	const missingCount = results.filter((r) => !r.image_key).length;

	function tile(r: (typeof results)[number]): string {
		const body = r.image_key
			? `<img src="/api/media/${r.image_key}" alt="${escapeHtml(r.canonical_name)}" loading="lazy" onerror="this.parentElement.classList.add('tile--broken');this.replaceWith(Object.assign(document.createElement('div'),{className:'broken',textContent:'BROKEN'}))">`
			: `<div class="missing">MISSING</div>`;
		return `
			<div class="tile ${r.image_key ? "" : "tile--missing"}">
				${body}
				<div class="label">${escapeHtml(r.canonical_name)}</div>
				<div class="meta">#${r.id}${r.scope ? " · " + escapeHtml(r.scope) : ""}</div>
			</div>`;
	}

	let tiles: string;
	if (flat) {
		tiles = `<div class="grid">${results.map(tile).join("")}</div>`;
	} else {
		// Group by scope (a club's country / a country's confederation) --
		// there's no dedicated "league" column in the schema, so this is the
		// closest real grouping the data actually has. Groups sorted
		// alphabetically (NULL scope last, as its own "Unknown" group);
		// within a group, missing-first same as the old flat sort.
		const groups = new Map<string, (typeof results)[number][]>();
		for (const r of results) {
			const key = r.scope ?? "￿"; // sort last
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key)!.push(r);
		}
		const sortedKeys = [...groups.keys()].sort();
		tiles = sortedKeys
			.map((key) => {
				const rows = groups.get(key)!;
				rows.sort((a, b) => Number(!!a.image_key) - Number(!!b.image_key) || a.canonical_name.localeCompare(b.canonical_name));
				const label = key === "￿" ? "Unknown" : key;
				const groupMissing = rows.filter((r) => !r.image_key).length;
				return `
					<div class="group">
						<div class="group-header">${escapeHtml(label)} <span>${rows.length - groupMissing}/${rows.length}</span></div>
						<div class="grid">${rows.map(tile).join("")}</div>
					</div>`;
			})
			.join("");
	}

	function pill(href: string, label: string, active: boolean): string {
		return `<a href="${href}" class="pill${active ? " pill--active" : ""}">${label}</a>`;
	}

	const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Media audit</title>
<style>
	body { font-family: system-ui, sans-serif; background: #111; color: #eee; margin: 0; padding: 20px; }
	h1 { font-size: 18px; margin: 0 0 4px; }
	.summary { color: #aaa; margin-bottom: 8px; font-size: 14px; }
	.filters { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; flex-wrap: wrap; }
	.filter-group { display: flex; gap: 4px; background: #1c1c1c; border: 1px solid #333; border-radius: 8px; padding: 3px; }
	.pill { color: #aaa; text-decoration: none; font-size: 13px; padding: 5px 12px; border-radius: 6px; }
	.pill:hover { color: #fff; }
	.pill--active { background: #2d5a3d; color: #fff; font-weight: 600; }
	.legend { display: flex; gap: 14px; font-size: 12px; color: #999; margin-bottom: 16px; }
	.legend span { display: inline-flex; align-items: center; gap: 5px; }
	.legend i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
	.group { margin-bottom: 22px; }
	.group-header { font-size: 13px; font-weight: 600; color: #ccc; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #2a2a2a; }
	.group-header span { color: #777; font-weight: 400; font-size: 11px; margin-left: 6px; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
	.tile { background: #1c1c1c; border: 1px solid #333; border-radius: 8px; padding: 10px; text-align: center; }
	.tile--missing { border-color: #a33; background: #2a1414; }
	.tile--broken { border-color: #c77; background: #2a1e14; }
	.tile img { max-width: 72px; max-height: 72px; object-fit: contain; background: #fff; border-radius: 4px; padding: 4px; }
	.missing, .broken { width: 72px; height: 72px; margin: 0 auto; display: flex; align-items: center; justify-content: center;
		color: #fff; font-size: 10px; font-weight: bold; border-radius: 4px; }
	.missing { background: #a33; }
	.broken { background: #b56b1f; }
	.label { font-size: 12px; margin-top: 6px; word-break: break-word; }
	.meta { font-size: 10px; color: #888; margin-top: 2px; }
</style>
</head>
<body>
	<h1>Media audit — ${type === "club" ? "Clubs" : "Countries"}${flat ? "" : ` (grouped by ${groupLabel.toLowerCase()})`}</h1>
	<div class="summary">${total} total, ${missingCount} missing image_key</div>
	<div class="filters">
		<div class="filter-group">
			${pill(`?type=club${missingOnly ? "&missing=1" : ""}${flat ? "&flat=1" : ""}`, "Clubs", type === "club")}
			${pill(`?type=country${missingOnly ? "&missing=1" : ""}${flat ? "&flat=1" : ""}`, "Countries", type === "country")}
		</div>
		<div class="filter-group">
			${pill(`?type=${type}${flat ? "&flat=1" : ""}`, "All", !missingOnly)}
			${pill(`?type=${type}&missing=1${flat ? "&flat=1" : ""}`, "Missing only", missingOnly)}
		</div>
		<div class="filter-group">
			${pill(`?type=${type}${missingOnly ? "&missing=1" : ""}`, `By ${groupLabel.toLowerCase()}`, !flat)}
			${pill(`?type=${type}${missingOnly ? "&missing=1" : ""}&flat=1`, "Flat list", flat)}
		</div>
	</div>
	<div class="legend">
		<span><i style="background:#a33"></i> Missing — no image_key set at all</span>
		<span><i style="background:#b56b1f"></i> Broken — image_key set, but the image failed to load</span>
		<span><i style="background:#fff"></i> A real image loaded</span>
	</div>
	${tiles}
</body>
</html>`;

	return c.html(html);
});

function escapeHtml(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default mediaAudit;
