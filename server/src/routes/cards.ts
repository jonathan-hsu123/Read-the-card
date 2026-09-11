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

cardsRouter.get("/random", (_req, res) => {
  const card = db
    .prepare(
      "SELECT name, rarity, type_line, mana_cost, image_url, first_year, first_set FROM printings ORDER BY RANDOM() LIMIT 1",
    )
    .get() as unknown as PrintingRow | undefined;

  if (!card) {
    res.status(503).json({ error: "no cards available — run the fetch-cards script first" });
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
    .prepare("SELECT DISTINCT name FROM printings WHERE name LIKE ? LIMIT 6")
    .all(`%${q}%`) as unknown as { name: string }[];

  res.json(rows.map((row) => row.name));
});
