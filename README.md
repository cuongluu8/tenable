# Tenable

A daily-playable "Top 10" football trivia game (inspired by
[Football Tenable](https://playfootball.games/football-tenable/) / the ITV
show *Tenable*). Browse a library of categories (e.g. "Top 10 Champions
League winners by club") and guess entries in Classic (unlimited guesses) or
Tension (5 lives) mode.

- **Live**: https://tenable.cuong-luu.workers.dev

**For architecture, data model, deployment, and Cloudflare cost details, see
[`agents.md`](./agents.md)** — that's the maintained source of truth for how
this app is built and run; keep this README as the quick-start only.

## Stack

- [**React**](https://react.dev/) + [**Vite**](https://vite.dev/) — frontend, in `src/react-app/`
- [**Hono**](https://hono.dev/) — backend on [**Cloudflare Workers**](https://developers.cloudflare.com/workers/), in `src/worker/`
- **Cloudflare D1** — quiz content: categories, entities (players/clubs/countries/
  managers — the single source for both answers and typeahead), dated stats,
  and the derived, materialized answer sets
- **Cloudflare KV** — per-device progress/streak state

## Development

Install dependencies:

```bash
npm install
```

Start the frontend dev server:

```bash
npm run dev
```

Your application will be available at [http://localhost:5173](http://localhost:5173).

For the full worker (API routes, D1, KV bindings) locally:

```bash
# Local D1 + KV (separate from production, stored under .wrangler/state):
npx wrangler d1 execute tenable-content --local --file=./db/schema.sql
npx wrangler d1 execute tenable-content --local --file=./db/seed.sql
npx wrangler dev --port 8787   # http://localhost:8787
```

`wrangler dev` here runs against a prebuilt bundle (`dist/tenable/wrangler.json`),
not `src/worker/` directly — always run `npm run build` before testing a
worker-code change locally, or you'll silently get the stale bundle.

```bash
npm run lint
```

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
