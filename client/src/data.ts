import type { Card } from "./types";

export const MAX_GUESSES = 6;

export const CLUE_LABELS: string[] = ["Rarity", "Type", "Mana cost", "First printed", "First set"];

export function getClueValue(card: Card, index: number): string {
  switch (index) {
    case 0:
      return card.rarity;
    case 1:
      return card.typeLine;
    case 2:
      return card.manaCost;
    case 3:
      return card.firstYear;
    case 4:
      return card.firstSet;
    default:
      return "";
  }
}