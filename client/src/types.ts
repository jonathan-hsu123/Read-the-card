export interface Card {
  name: string;
  rarity: string;
  typeLine: string;
  manaCost: string;
  firstYear: string;
  firstSet: string;
  imageUrl: string;
}
 
export type GameStatus = "playing" | "won" | "lost";
 
export interface GuessRecord {
  name: string;
  correct: boolean;
}