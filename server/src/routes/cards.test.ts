import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../app.js";
import { db } from "../db.js";

interface Row {
  id: string;
  name: string;
  year: string;
  universesBeyond?: boolean;
  booster?: boolean;
  firstPrinting?: boolean;
  secretLair?: boolean;
}

const rows: Row[] = [
  { id: "bolt-1993", name: "Lightning Bolt", year: "1993", firstPrinting: true },
  { id: "bolt-2010", name: "Lightning Bolt", year: "2010" },
  { id: "sol-ring-sld", name: "Sol Ring", year: "2020", booster: false, secretLair: true },
  { id: "ub-card", name: "Universes Card", year: "2023", universesBeyond: true, firstPrinting: true },
];

let server: Server;
let baseUrl: string;

async function get(path: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${baseUrl}${path}`);
  return { status: res.status, body: await res.json() };
}

beforeAll(() => {
  const insert = db.prepare(`
    INSERT INTO printings (
      scryfall_id, oracle_id, name, rarity, type_line, mana_cost, image_url, set_name, year,
      first_year, first_set, first_image_url,
      is_universes_beyond, is_booster, is_first_printing, is_secret_lair
    ) VALUES (?, ?, ?, 'common', 'Instant', '{R}', ?, 'Some Set', ?, ?, 'First Set', '', ?, ?, ?, ?)
  `);
  for (const row of rows) {
    insert.run(
      row.id,
      row.name,
      row.name,
      `https://example.com/${row.id}.jpg`,
      row.year,
      row.year,
      row.universesBeyond ? 1 : 0,
      row.booster === false ? 0 : 1,
      row.firstPrinting ? 1 : 0,
      row.secretLair ? 1 : 0,
    );
  }

  server = app.listen(0);
  baseUrl = `http://localhost:${(server.address() as AddressInfo).port}/api/cards`;
});

afterAll(() => {
  server.close();
});

describe("GET /search", () => {
  it("returns distinct matching names", async () => {
    expect(await get("/search?q=bolt")).toEqual({ status: 200, body: ["Lightning Bolt"] });
  });

  it("returns an empty list for a blank query", async () => {
    expect(await get("/search?q=%20")).toEqual({ status: 200, body: [] });
  });
});

describe("GET /year-range", () => {
  it("returns the min and max printing years", async () => {
    expect(await get("/year-range")).toEqual({ status: 200, body: { min: 1993, max: 2023 } });
  });
});

describe("GET /random", () => {
  it("returns a card in the client shape", async () => {
    const { status, body } = await get("/random");
    expect(status).toBe(200);
    expect(Object.keys(body as object).sort()).toEqual(
      ["firstSet", "firstYear", "imageUrl", "manaCost", "name", "rarity", "typeLine"].sort(),
    );
  });

  it("applies filters", async () => {
    const { body } = await get(
      "/random?excludeUniversesBeyond=true&excludeNonBooster=true&yearStart=2000",
    );
    expect(body).toMatchObject({ name: "Lightning Bolt", imageUrl: "https://example.com/bolt-2010.jpg" });
  });

  it("returns 404 when nothing matches", async () => {
    const { status } = await get("/random?yearStart=2030");
    expect(status).toBe(404);
  });
});
