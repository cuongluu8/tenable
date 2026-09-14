# Top-10 Tension

Football trivia, four games, three ways to play. Started as a daily-playable
"Top 10" game (inspired by [Football Tenable](https://playfootball.games/football-tenable/)
/ the ITV show *Tenable*) and grew from there.

**Games**

- **Daily categories** — guess a category's Top 10 (e.g. "Champions League
  winners by club") in Classic (unlimited guesses) or Tension (5 lives) mode.
- **Club Run** — name the player from the badges of the clubs they played for.
- **Teammate Tell** — name the mystery player from their former teammates.
- **Roll of Honour** — a grid of seasons for a competition (European Cup,
  Champions League, English First Division, Premier League); fill in every
  season's champion.

**Ways to play**

- **Single player** — solo, at your own pace; Club Run and Teammate Tell as
  curated Sets, Roll of Honour with 5 lives and a country hint.
- **Multiplayer (pass and play)** — one device, take turns.
- **Remote play** — friends on their own devices race on one session code:
  first correct guess wins each question (or each season, in Roll of
  Honour), with a lobby, timed hints, give up, a chat/activity pane, mid-game
  joining and "Play again". Backed by a Cloudflare Durable Object.

- **Live**: https://top-10-tension.cuong-luu.workers.dev

**For architecture, data model, deployment, and Cloudflare cost details, see
[`agents.md`](./agents.md)** — that's the maintained source of truth for how
this app is built and run; keep this README as the quick-start only.

## Stack

- [**React**](https://react.dev/) + [**Vite**](https://vite.dev/) — frontend, in `src/react-app/`
- [**Hono**](https://hono.dev/) — backend on [**Cloudflare Workers**](https://developers.cloudflare.com/workers/), in `src/worker/`
- **Cloudflare D1** — quiz content: categories, entities (players/clubs/countries/
  managers — the single source for both answers and typeahead), dated stats,
  the derived, materialized answer sets, and the Club Run / Teammate Tell
  question tables
- **Cloudflare KV** — per-device progress/streak state, and the live-scores ticker
- **Cloudflare R2** — club badge and country flag images (`tenable-media`)
- **Cloudflare Durable Objects** (SQLite-backed) — one object per remote-play
  session, in `src/worker/durableObjects/`

## Development

Install dependencies:

```bash
npm install
```

Start the dev server (the Cloudflare Vite plugin runs the Worker — API
routes, D1, KV, R2, the Durable Object — alongside the frontend in one
process, so this is the whole app):

```bash
npm run dev
```

Your application will be available at [http://localhost:5173](http://localhost:5173).

To run the prebuilt Worker bundle on its own with `wrangler dev` instead:

```bash
# Local D1 + KV (separate from production, stored under .wrangler/state):
npx wrangler d1 execute tenable-content --local --file=./db/schema.sql
npx wrangler d1 execute tenable-content --local --file=./db/seed.sql
npx wrangler dev --port 8787   # http://localhost:8787
```

`wrangler dev` here runs against a prebuilt bundle (`dist/top_10_tension/wrangler.json`
— underscores, not hyphens: Vite's own environment-name rules, derived from
`wrangler.json`'s `name` field, don't allow hyphens),
not `src/worker/` directly — always run `npm run build` before testing a
worker-code change locally, or you'll silently get the stale bundle.

Checks:

```bash
npm run lint
npm run test:unit          # pure logic and reducers (vitest)
npm run test:integration   # real routes and the Durable Object against a small local fixture
npm run test:e2e           # Playwright against a real dev server, every game and mode
npm run verify:all         # coverage-gated unit + integration + e2e + build
```

Content checks (`verify:matching`, `verify:category-defs`, `verify:query-plans`,
`playtest`, `verify:content-source`) are described in [`agents.md`](./agents.md).

## Production

Build your project for production:

```bash
npm run build
```

Preview your build locally:

```bash
npm run preview
```

**Deployment is not `npm run deploy`** — this project deploys via Cloudflare
Workers Builds (Cloudflare's own Git integration; every push to `main` is
auto-built and deployed by Cloudflare's infrastructure). See the Deployment
section in [`agents.md`](./agents.md) for details on why, and why a GitHub
Actions deploy step should not be re-added.

Monitor the live worker:

```bash
npx wrangler tail
```

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://reactjs.org/)
- [Hono Documentation](https://hono.dev/)
