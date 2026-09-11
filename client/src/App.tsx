import React from "react";
import { CardFrame } from "./components/CardFrame";
import { ClueList } from "./components/ClueList";
import { GuessHistory } from "./components/GuessHistory";
import { GuessInput } from "./components/GuessInput";
import { Settings } from "./components/Settings";
import { StatusBanner } from "./components/StatusBanner";
import { MAX_GUESSES } from "./data";
import { useLoadFont } from "./hooks/useLoadFont";
import { useSettings } from "./hooks/useSettings";
import { useTriviaGame } from "./hooks/useTriviaGame";
import { COLORS, FONT_FAMILY } from "./theme";

export default function App() {
  useLoadFont();
  const { settings, updateSettings } = useSettings();

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
    noMatches,
    revealing,
    setInputValue,
    setShowSuggestions,
    submitGuess,
    nextCard,
    shuffleWithReveal,
  } = useTriviaGame(settings);

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <h1 style={{ fontSize: 32, fontWeight: 600, color: COLORS.ink, margin: 0 }}>
              Read the card...
            </h1>
            <p style={{ color: COLORS.secondary, fontSize: 14, marginTop: 4 }}>
              What is this card? You get 6 guesses.
            </p>
          </div>
          <Settings settings={settings} onChange={updateSettings} />
        </div>

        {noMatches ? (
          <p style={{ color: COLORS.secondary, fontSize: 14 }}>
            No cards match the current filters — try loosening them in Settings.
          </p>
        ) : !card ? (
          <p style={{ color: COLORS.secondary, fontSize: 14 }}>Loading...</p>
        ) : (
          <>
            <CardFrame
              card={card}
              revealed={status === "won" || status === "lost" || revealing}
              revealColor={
                status === "won" ? COLORS.correct : status === "lost" ? COLORS.incorrect : COLORS.ink
              }
            />

            {status === "playing" && !revealing && (
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
                onShuffle={shuffleWithReveal}
              />
            )}

            {(status === "won" || status === "lost") && (
              <StatusBanner status={status} wrongGuesses={wrongGuesses} onNext={nextCard} />
            )}

            <ClueList card={card} status={status} revealedCount={revealedCount} />

            <GuessHistory history={guessHistory} />
          </>
        )}
      </div>
    </div>
  );
}
