import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { createGunzip } from "node:zlib";
import { db } from "../src/db.js";

interface ScryfallCard {
  id: string;
  oracle_id?: string;
  name: string;
  lang: string;
  digital: boolean;
  games: string[];
  layout: string;
  rarity: string;
  type_line?: string;
  cmc: number;
  released_at: string;
  set: string;
  set_name: string;
  frame_effects?: string[];
  legalities: { vintage: string };
  image_uris?: { art_crop?: string };
  card_faces?: { oracle_id?: string; type_line?: string; image_uris?: { art_crop?: string } }[];
  booster: boolean;
  promo_types?: string[];
}

function isUniversesBeyond(card: ScryfallCard): boolean {
  return (card.promo_types ?? []).includes("universesbeyond");
}

// Scryfall doesn't have a single "is Secret Lair" flag — these are the actual
// set codes for Secret Lair products (confirmed against Scryfall's /sets),
// including ones that aren't literally named "Secret Lair" (e.g. slx).
const SECRET_LAIR_SET_CODES = new Set(["sld", "slc", "slu", "slp", "slz", "slx", "pssc"]);

function isSecretLair(card: ScryfallCard): boolean {
  return SECRET_LAIR_SET_CODES.has(card.set);
}

function getImageUrl(card: ScryfallCard): string | undefined {
  return card.image_uris?.art_crop ?? card.card_faces?.[0]?.image_uris?.art_crop;
}

function getTypeLine(card: ScryfallCard): string | undefined {
  return card.type_line ?? card.card_faces?.[0]?.type_line;
}

function getName(card: ScryfallCard): string {
  const parts = card.name.split(" // ");
  return parts.length > 1 && parts.every((part) => part === parts[0]) ? parts[0] : card.name;
}

function getOracleId(card: ScryfallCard): string | undefined {
  return card.oracle_id ?? card.card_faces?.[0]?.oracle_id;
}

const EXCLUDED_FRAME_EFFECTS = new Set([
  "inverted",
  "extendedart",
  "showcase",
  "fullart",
  "borderless",
]);

function hasExcludedFrameEffect(card: ScryfallCard): boolean {
  return (card.frame_effects ?? []).some((effect) => EXCLUDED_FRAME_EFFECTS.has(effect));
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
    !hasExcludedFrameEffect(card) &&
    card.legalities.vintage !== "not_legal" &&
    Boolean(getImageUrl(card)) &&
    Boolean(getTypeLine(card)) &&
    Boolean(getOracleId(card))
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
      image_url   TEXT NOT NULL,
      is_universes_beyond INTEGER NOT NULL,
      is_booster           INTEGER NOT NULL,
      is_secret_lair        INTEGER NOT NULL
    );
  `);

  const insertRaw = db.prepare(`
    INSERT OR IGNORE INTO printings_raw
      (scryfall_id, oracle_id, name, rarity, type_line, mana_cost, released_at, set_name, image_url,
       is_universes_beyond, is_booster, is_secret_lair)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        getOracleId(card)!,
        getName(card),
        card.rarity,
        getTypeLine(card)!.split(" — ")[0],
        String(card.cmc),
        card.released_at,
        card.set_name,
        getImageUrl(card) ?? "",
        isUniversesBeyond(card) ? 1 : 0,
        card.booster ? 1 : 0,
        isSecretLair(card) ? 1 : 0,
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
      (scryfall_id, oracle_id, name, rarity, type_line, mana_cost, image_url, set_name, year,
       first_year, first_set, first_image_url, is_universes_beyond, is_booster, is_first_printing,
       is_secret_lair)
    SELECT
      r.scryfall_id, r.oracle_id, r.name, r.rarity, r.type_line, r.mana_cost, r.image_url,
      r.set_name, substr(r.released_at, 1, 4),
      substr(f.first_released_at, 1, 4), f.first_set_name, f.first_image_url,
      r.is_universes_beyond, r.is_booster,
      CASE WHEN r.scryfall_id = f.first_scryfall_id THEN 1 ELSE 0 END,
      r.is_secret_lair
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
        ) AS first_set_name,
        (
          SELECT p2.image_url FROM printings_raw p2
          WHERE p2.oracle_id = p1.oracle_id
          ORDER BY p2.released_at ASC
          LIMIT 1
        ) AS first_image_url,
        (
          SELECT p2.scryfall_id FROM printings_raw p2
          WHERE p2.oracle_id = p1.oracle_id
          ORDER BY p2.released_at ASC
          LIMIT 1
        ) AS first_scryfall_id
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
