import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

// wrangler.json's MEDIA binding is `remote: true` so a human running
// `npm run dev` sees real uploaded R2 images locally -- but that means
// this plugin always opens an authenticated "remote proxy session" on
// startup for that binding, which needs a real Cloudflare credential and
// fails outright in a non-interactive environment ("In a non-interactive
// environment, it's necessary to set a CLOUDFLARE_API_TOKEN...").
// Playwright's e2e suite (playwright.config.ts) runs this same `npm run
// dev` as its webServer, in CI, with no such credential -- confirmed the
// hard way, a real CI failure this env-gated override exists to prevent
// recurring. E2E_LOCAL_ONLY (set only by playwright.config.ts's
// webServer.env, never by a person running `npm run dev` themselves)
// forces every binding local instead, same as
// vitest.integration.config.ts's own remoteBindings: false -- no e2e
// test asserts on real image content, so this costs nothing there.
export default defineConfig({
	plugins: [react(), cloudflare(process.env.E2E_LOCAL_ONLY ? { remoteBindings: false } : {})],
});
