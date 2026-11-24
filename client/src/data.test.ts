import { describe, expect, it } from "vitest";
import { CLUE_LABELS, getClueValue } from "./data";
import type { Card } from "./types";

const card: Card = {
  name: "Lightning Bolt",
  rarity: "common",
  typeLine: "Instant",
  manaCost: "{R}",
  firstYear: "1993",
  firstSet: "Limited Edition Alpha",
  imageUrl: "https://example.com/bolt.jpg",
};

describe("getClueValue", () => {
  it("returns clues in label order", () => {
    expect(CLUE_LABELS.map((_, i) => getClueValue(card, i))).toEqual([
      "common",
      "Instant",
      "{R}",
      "1993",
      "Limited Edition Alpha",
    ]);
  });

  it("returns an empty string past the last clue", () => {
    expect(getClueValue(card, CLUE_LABELS.length)).toBe("");
  });
});
