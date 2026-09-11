import { useEffect, useState } from "react";
import { MAX_GUESSES } from "../data";
import type { Card, GameStatus, GuessRecord } from "../types";

export interface TriviaGameState {
  card: Card | null;
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
  const [card, setCard] = useState<Card | null>(null);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [guessHistory, setGuessHistory] = useState<GuessRecord[]>([]);
  const [fetchedSuggestions, setFetchedSuggestions] = useState<string[]>([]);

  const revealedCount = Math.min(wrongGuesses, MAX_GUESSES - 1);
  const guessesLeft = MAX_GUESSES - wrongGuesses;
  const suggestions = inputValue.trim() ? fetchedSuggestions : [];

  useEffect(() => {
    loadNextCard();
  }, []);

  useEffect(() => {
    const query = inputValue.trim();
    if (!query) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/cards/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((names: string[]) => setFetchedSuggestions(names))
        .catch((err) => {
          if (err.name !== "AbortError") console.error(err);
        });
    }, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [inputValue]);

  function loadNextCard(): void {
    fetch("/api/cards/random")
      .then((res) => res.json())
      .then((data: Card) => setCard(data))
      .catch(console.error);
  }

  function submitGuess(name: string): void {
    if (status !== "playing" || !card) return;

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
    setCard(null);
    setWrongGuesses(0);
    setStatus("playing");
    setInputValue("");
    setGuessHistory([]);
    loadNextCard();
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
