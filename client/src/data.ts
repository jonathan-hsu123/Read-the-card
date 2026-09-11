import type { Card } from "./types";

export const MOCK_CARDS: Card[] = [
  {
    id: 1,
    name: "Lightning Bolt",
    rarity: "Common",
    typeLine: "Instant",
    manaCost: "{R}",
    firstYear: "1993",
    firstSet: "Limited Edition Alpha",
    imageUrl: "https://api.scryfall.com/cards/named?exact=Lightning+Bolt&format=image&version=art_crop",
  },
  {
    id: 2,
    name: "Llanowar Elves",
    rarity: "Common",
    typeLine: "Creature — Elf Druid",
    manaCost: "{G}",
    firstYear: "1994",
    firstSet: "Legends",
    imageUrl: "https://api.scryfall.com/cards/named?exact=Llanowar+Elves&format=image&version=art_crop",
  },
  {
    id: 3,
    name: "Wrath of God",
    rarity: "Rare",
    typeLine: "Sorcery",
    manaCost: "{2}{W}{W}",
    firstYear: "1993",
    firstSet: "Limited Edition Alpha",
    imageUrl: "https://api.scryfall.com/cards/named?exact=Wrath+of+God&format=image&version=art_crop",
  },
  {
    id: 4,
    name: "Tarmogoyf",
    rarity: "Rare",
    typeLine: "Creature — Lhurgoyf",
    manaCost: "{1}{G}",
    firstYear: "2007",
    firstSet: "Future Sight",
    imageUrl: "https://api.scryfall.com/cards/named?exact=Tarmogoyf&format=image&version=art_crop",
  },
];

export const ALL_NAMES: string[] = [
  "Lightning Bolt",
  "Llanowar Elves",
  "Wrath of God",
  "Tarmogoyf",
  "Counterspell",
  "Swords to Plowshares",
  "Birds of Paradise",
  "Dark Ritual",
  "Sol Ring",
  "Brainstorm",
  "Lightning Helix",
  "Path to Exile",
];

export const MAX_GUESSES = 5;

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