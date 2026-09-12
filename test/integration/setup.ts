// Seeds the isolated local D1 vitest-plugin gives each test FILE (see its
// own "isolated storage" model) with db/schema.sql plus a small,
// hand-authored fixture -- NOT db/seed.sql. See fixtures/core.sql's own
// doc for why: applying the real, ~7.8MB/63k-statement production seed
// inside a test's D1 turned out to hang or crash the test worker at that
// scale, a genuine limit in this test tool as of @cloudflare/vitest-plugin
// 1.1.8, not a bug in the approach below. Runs once per test file via
// Vitest's setupFiles, not once per test case -- a file's own tests share
// the seeded data.
//
// D1's own env.DB.exec() was tried first and rejected: it requires one
// statement per line and errors out on schema.sql's prose comments and
// multi-line CREATE TABLE statements. splitSqlStatements.ts does real
// (string-literal-aware) statement splitting instead, then this applies
// them via batch().
//
// `?raw` (a Vite import suffix) inlines each file's contents as a plain
// string at bundle time -- this plugin runs tests inside an actual
// workerd isolate, not Node, so there's no fs.readFileSync available at
// test time.
import { env } from "cloudflare:test";
import { beforeAll } from "vitest";
import schemaSql from "../../db/schema.sql?raw";
import fixtureSql from "./fixtures/core.sql?raw";
import { splitSqlStatements } from "./splitSqlStatements";

beforeAll(async () => {
	const statements = [...splitSqlStatements(schemaSql), ...splitSqlStatements(fixtureSql)];
	await env.DB.batch(statements.map((statement) => env.DB.prepare(statement)));
});
