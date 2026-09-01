import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { resolve } from "path";
import fetch from "node-fetch";


/**
 * Bulk‑import players from Wikidata.
 * Generates batched INSERT statements in `scripts/generated/players.sql`.
 */
const SPARQL = `
SELECT ?player ?playerLabel ?countryCode WHERE {
  ?player wdt:P31 wd:Q5;               # instance of human
          wdt:P106 wd:Q937857.        # occupation: association football player
  OPTIONAL {
    ?player wdt:P27 ?country.
    ?country wdt:P297 ?countryCode.   # ISO‑3166‑1 alpha‑2
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`;

async function fetchPage(offset: number): Promise<any[]> {
  const pagedQuery = `${SPARQL}\nLIMIT ${PAGE_SIZE}\nOFFSET ${offset}`;
  const url = "https://query.wikidata.org/sparql";
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      Accept: "application/sparql-results+json",
    },
    body: pagedQuery,
  });
  if (!resp.ok) {
    // simple retry for transient server errors (502/503)
    if (resp.status >= 500 && resp.status < 600) {
      console.warn(`Got ${resp.status}, retrying after 1s…`);
      await new Promise((r) => setTimeout(r, 1000));
      return fetchPage(offset);
    }
    throw new Error(`Wikidata error ${resp.status}`);
  }
  const json = await resp.json();
  return json.results.bindings;
}

async function fetchAllPlayers() {
  let offset = 0;
  const all: any[] = [];
  while (true) {
    const page = await fetchPage(offset);
    if (page.length === 0) break;
    all.push(...page);
    console.log(`Fetched ${bindings.length} raw player rows.");
    offset += PAGE_SIZE;
  }
  return all;
}

async function main() {
  const bindings = await fetchAllPlayers();
  const rows = bindings.map((b: any) => {
    const name = b.playerLabel.value.trim();
    const scope = b.countryCode?.value ?? undefined; // ISO‑2 if present
    return { name, scope };
  });

  // De‑duplicate by canonical name (case‑insensitive)
  const seen = new Set<string>();
  const uniq: { name: string; scope?: string }[] = [];
  for (const r of rows) {
    const key = r.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(r);
    }
  }

  writeBatches(uniq);
}
