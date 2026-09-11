import { useMemo, useState } from "react";
import { ALL_NAMES, MAX_GUESSES, MOCK_CARDS } from "../data";
import type { Card, GameStatus, GuessRecord } from "../types";

export interface TriviaGameState {
  card: Card;
  status: GameStatus;
  wrongGuesses: number;
  guessesLeft: number;
  revealedCount: number;
  guessHistory: GuessRecord[];
  inputValue: string;
  showSuggestions: boolean;
  suggestions: string[];
  setInputValue: (value: string) => void;
  setShowSuggestions: (show: boolean) => void;
  submitGuess: (name: string) => void;
  nextCard: () => void;
}

export function useTriviaGame(): TriviaGameState {
  const [cardIndex, setCardIndex] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [guessHistory, setGuessHistory] = useState<GuessRecord[]>([]);

  const card = MOCK_CARDS[cardIndex];
  const revealedCount = Math.min(wrongGuesses, MAX_GUESSES - 1);
  const guessesLeft = MAX_GUESSES - wrongGuesses;

  const suggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return [];
    return ALL_NAMES.filter((name) => name.toLowerCase().includes(query)).slice(0, 6);
  }, [inputValue]);

  function submitGuess(name: string): void {
    if (status !== "playing") return;

    const correct = name === card.name;
    setGuessHistory((history) => [...history, { name, correct }]);
    setInputValue("");
    setShowSuggestions(false);

    if (correct) {
      setStatus("won");
      return;
    }

    const next = wrongGuesses + 1;
    setWrongGuesses(next);
    if (next >= MAX_GUESSES) {
      setStatus("lost");
    }
  }

  function nextCard(): void {
    setCardIndex((index) => (index + 1) % MOCK_CARDS.length);
    setWrongGuesses(0);
    setStatus("playing");
    setInputValue("");
    setGuessHistory([]);
  }

  return {
    card,
    status,
    wrongGuesses,
    guessesLeft,
    revealedCount,
    guessHistory,
    inputValue,
    showSuggestions,
    suggestions,
    setInputValue,
    setShowSuggestions,
    submitGuess,
    nextCard,
  };
}