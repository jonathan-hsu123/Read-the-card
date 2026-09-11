import { Router } from "express";
import { db } from "../db.js";

export const cardsRouter = Router();

interface PrintingRow {
  name: string;
  rarity: string;
  type_line: string;
  mana_cost: string;
  image_url: string;
  first_year: string;
  first_set: string;
}

function isTrue(value: unknown): boolean {
  return value === "true" || value === "1";
}

cardsRouter.get("/random", (req, res) => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (isTrue(req.query.excludeUniversesBeyond)) {
    conditions.push("is_universes_beyond = 0");
  }
  if (isTrue(req.query.excludeNonBooster)) {
    conditions.push("is_booster = 1");
  }
  if (isTrue(req.query.onlyFirstPrinting)) {
    conditions.push("is_first_printing = 1");
  }
  if (isTrue(req.query.excludeSecretLair)) {
    conditions.push("is_secret_lair = 0");
  }
  const yearStart = Number(req.query.yearStart);
  if (Number.isInteger(yearStart)) {
    conditions.push("CAST(year AS INTEGER) >= ?");
    params.push(yearStart);
  }
  const yearEnd = Number(req.query.yearEnd);
  if (Number.isInteger(yearEnd)) {
    conditions.push("CAST(year AS INTEGER) <= ?");
    params.push(yearEnd);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const card = db
    .prepare(
      `SELECT name, rarity, type_line, mana_cost, image_url, first_year, first_set
       FROM printings ${where} ORDER BY RANDOM() LIMIT 1`,
    )
    .get(...params) as unknown as PrintingRow | undefined;

  if (!card) {
    res.status(404).json({ error: "no cards match the current filters" });
    return;
  }

  res.json({
    name: card.name,
    imageUrl: card.image_url,
    rarity: card.rarity,
    typeLine: card.type_line,
    manaCost: card.mana_cost,
    firstYear: card.first_year,
    firstSet: card.first_set,
  });
});

cardsRouter.get("/search", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) {
    res.json([]);
    return;
  }

  const rows = db
    .prepare("SELECT DISTINCT name FROM printings WHERE name LIKE ? LIMIT 20")
    .all(`%${q}%`) as unknown as { name: string }[];

  res.json(rows.map((row) => row.name));
});

cardsRouter.get("/year-range", (_req, res) => {
  const row = db
    .prepare("SELECT MIN(CAST(year AS INTEGER)) AS min, MAX(CAST(year AS INTEGER)) AS max FROM printings")
    .get() as unknown as { min: number; max: number };

  res.json({ min: row.min, max: row.max });
});
