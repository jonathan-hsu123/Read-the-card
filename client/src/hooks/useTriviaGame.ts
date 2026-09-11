import { useEffect, useState } from "react";
import { MAX_GUESSES } from "../data";
import type { Settings } from "./useSettings";
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
  noMatches: boolean;
  revealing: boolean;
  setInputValue: (value: string) => void;
  setShowSuggestions: (show: boolean) => void;
  submitGuess: (name: string) => void;
  nextCard: () => void;
  shuffleWithReveal: () => void;
}

const SHUFFLE_REVEAL_MS = 1000;

function buildRandomUrl(settings: Settings): string {
  const params = new URLSearchParams();
  if (settings.excludeUniversesBeyond) params.set("excludeUniversesBeyond", "true");
  if (settings.excludeNonBooster) params.set("excludeNonBooster", "true");
  if (settings.onlyFirstPrinting) params.set("onlyFirstPrinting", "true");
  if (settings.excludeSecretLair) params.set("excludeSecretLair", "true");
  if (settings.yearStart !== null) params.set("yearStart", String(settings.yearStart));
  if (settings.yearEnd !== null) params.set("yearEnd", String(settings.yearEnd));
  const query = params.toString();
  return `/api/cards/random${query ? `?${query}` : ""}`;
}

export function useTriviaGame(settings: Settings): TriviaGameState {
  const [card, setCard] = useState<Card | null>(null);
  const [noMatches, setNoMatches] = useState(false);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [guessHistory, setGuessHistory] = useState<GuessRecord[]>([]);
  const [fetchedSuggestions, setFetchedSuggestions] = useState<string[]>([]);
  const [revealing, setRevealing] = useState(false);

  const revealedCount = Math.min(wrongGuesses, MAX_GUESSES - 1);
  const guessesLeft = MAX_GUESSES - wrongGuesses;
  const suggestions = inputValue.trim() ? fetchedSuggestions : [];

  useEffect(() => {
    loadNextCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.excludeUniversesBeyond,
    settings.excludeNonBooster,
    settings.onlyFirstPrinting,
    settings.excludeSecretLair,
    settings.yearStart,
    settings.yearEnd,
  ]);

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
    setNoMatches(false);
    fetch(buildRandomUrl(settings))
      .then(async (res) => {
        if (res.status === 404) {
          setNoMatches(true);
          setCard(null);
          return;
        }
        const data = (await res.json()) as Card;
        setCard(data);
      })
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

  function shuffleWithReveal(): void {
    if (revealing) return;
    setRevealing(true);
    setTimeout(() => {
      setRevealing(false);
      nextCard();
    }, SHUFFLE_REVEAL_MS);
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
    noMatches,
    revealing,
    setInputValue,
    setShowSuggestions,
    submitGuess,
    nextCard,
    shuffleWithReveal,
  };
}
