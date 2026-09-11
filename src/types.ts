export interface Card {
  id: number;
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