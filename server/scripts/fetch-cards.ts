import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { createGunzip } from "node:zlib";
import { db } from "../src/db.js";

interface ScryfallCard {
  id: string;
  oracle_id: string;
  name: string;
  lang: string;
  digital: boolean;
  games: string[];
  layout: string;
  rarity: string;
  type_line: string;
  mana_cost?: string;
  released_at: string;
  set_name: string;
  image_uris?: { art_crop?: string };
}

const SCRYFALL_HEADERS = {
  "User-Agent": "ReadTheCard/0.0.0 (https://github.com/; local dev bulk-data import script)",
  Accept: "application/json",
};

async function getDefaultCardsUrl(): Promise<string> {
  const res = await fetch("https://api.scryfall.com/bulk-data", { headers: SCRYFALL_HEADERS });
  if (!res.ok) throw new Error(`Failed to fetch bulk-data listing: ${res.status}`);
  const body = (await res.json()) as { data: { type: string; jsonl_download_uri: string }[] };
  const entry = body.data.find((d) => d.type === "default_cards");
  if (!entry) throw new Error("default_cards entry not found in bulk-data listing");
  return entry.jsonl_download_uri;
}

function isUsable(card: ScryfallCard): boolean {
  return (
    card.lang === "en" &&
    card.digital === false &&
    card.games.includes("paper") &&
    card.layout === "normal" &&
    Boolean(card.image_uris?.art_crop)
  );
}

async function main() {
  console.log("Fetching bulk-data listing...");
  const downloadUrl = await getDefaultCardsUrl();
  console.log(`Downloading default_cards from ${downloadUrl}`);

  const res = await fetch(downloadUrl, { headers: SCRYFALL_HEADERS });
  if (!res.ok || !res.body) throw new Error(`Failed to download bulk data: ${res.status}`);

  db.exec("DROP TABLE IF EXISTS printings_raw;");
  db.exec(`
    CREATE TABLE printings_raw (
      scryfall_id TEXT PRIMARY KEY,
      oracle_id   TEXT NOT NULL,
      name        TEXT NOT NULL,
      rarity      TEXT NOT NULL,
      type_line   TEXT NOT NULL,
      mana_cost   TEXT NOT NULL,
      released_at TEXT NOT NULL,
      set_name    TEXT NOT NULL,
      image_url   TEXT NOT NULL
    );
  `);

  const insertRaw = db.prepare(`
    INSERT OR IGNORE INTO printings_raw
      (scryfall_id, oracle_id, name, rarity, type_line, mana_cost, released_at, set_name, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const nodeStream = Readable.fromWeb(res.body as never);
  const lines = createInterface({ input: nodeStream.pipe(createGunzip()), crlfDelay: Infinity });

  let seen = 0;
  let kept = 0;

  db.exec("BEGIN TRANSACTION;");
  for await (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const card = JSON.parse(trimmed) as ScryfallCard;
    seen += 1;
    if (isUsable(card)) {
      kept += 1;
      insertRaw.run(
        card.id,
        card.oracle_id,
        card.name,
        card.rarity,
        card.type_line,
        card.mana_cost ?? "",
        card.released_at,
        card.set_name,
        card.image_uris?.art_crop ?? "",
      );
    }
    if (seen % 20000 === 0) console.log(`  processed ${seen} printings, kept ${kept}`);
  }
  db.exec("COMMIT;");
  console.log(`Staged ${kept} of ${seen} printings.`);

  console.log("Computing first-printing year/set per card...");
  db.exec("CREATE INDEX idx_printings_raw_oracle ON printings_raw(oracle_id, released_at);");

  db.exec("DELETE FROM printings;");
  db.exec(`
    INSERT INTO printings
      (scryfall_id, oracle_id, name, rarity, type_line, mana_cost, image_url, first_year, first_set)
    SELECT
      r.scryfall_id, r.oracle_id, r.name, r.rarity, r.type_line, r.mana_cost, r.image_url,
      substr(f.first_released_at, 1, 4), f.first_set_name
    FROM printings_raw r
    JOIN (
      SELECT
        p1.oracle_id AS oracle_id,
        MIN(p1.released_at) AS first_released_at,
        (
          SELECT p2.set_name FROM printings_raw p2
          WHERE p2.oracle_id = p1.oracle_id
          ORDER BY p2.released_at ASC
          LIMIT 1
        ) AS first_set_name
      FROM printings_raw p1
      GROUP BY p1.oracle_id
    ) f ON f.oracle_id = r.oracle_id;
  `);

  db.exec("DROP TABLE printings_raw;");

  const { count } = db.prepare("SELECT COUNT(*) AS count FROM printings").get() as unknown as {
    count: number;
  };
  console.log(`Done. printings table has ${count} rows.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
