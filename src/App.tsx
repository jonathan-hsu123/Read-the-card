import React from "react";
import { CardFrame } from "./components/CardFrame";
import { ClueList } from "./components/ClueList";
import { GuessHistory } from "./components/GuessHistory";
import { GuessInput } from "./components/GuessInput";
import { StatusBanner } from "./components/StatusBanner";
import { MAX_GUESSES } from "./data";
import { useLoadFont } from "./hooks/useLoadFont";
import { useTriviaGame } from "./hooks/useTriviaGame";
import { COLORS, FONT_FAMILY } from "./theme";

export default function App() {
  useLoadFont();

  const {
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
  } = useTriviaGame();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        display: "flex",
        justifyContent: "center",
        padding: "24px 20px",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: COLORS.ink, margin: 0 }}>
            Name that card
          </h1>
          <p style={{ color: COLORS.secondary, fontSize: 14, marginTop: 4 }}>
            Five guesses. A clue unlocks after each miss.
          </p>
        </div>

        <CardFrame card={card} status={status} />

        {status === "playing" && (
          <GuessInput
            value={inputValue}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            wrongGuesses={wrongGuesses}
            maxGuesses={MAX_GUESSES}
            guessesLeft={guessesLeft}
            onChange={(value) => {
              setInputValue(value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onSelect={submitGuess}
          />
        )}

        {(status === "won" || status === "lost") && (
          <StatusBanner status={status} wrongGuesses={wrongGuesses} onNext={nextCard} />
        )}

        <ClueList card={card} status={status} revealedCount={revealedCount} />

        <GuessHistory history={guessHistory} />
      </div>
    </div>
  );
}