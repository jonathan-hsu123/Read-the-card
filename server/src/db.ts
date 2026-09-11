import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env.DB_PATH ?? "./data/cards.sqlite";

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
  CREATE TABLE IF NOT EXISTS printings (
    scryfall_id   TEXT PRIMARY KEY,
    oracle_id     TEXT NOT NULL,
    name          TEXT NOT NULL,
    rarity        TEXT NOT NULL,
    type_line     TEXT NOT NULL,
    mana_cost     TEXT NOT NULL,
    image_url     TEXT NOT NULL,
    first_year    TEXT NOT NULL,
    first_set     TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_printings_name ON printings(name);
`);
