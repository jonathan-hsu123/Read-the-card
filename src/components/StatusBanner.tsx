import React from "react";
import { COLORS } from "../theme";
import type { GameStatus } from "../types";

interface StatusBannerProps {
  status: Extract<GameStatus, "won" | "lost">;
  wrongGuesses: number;
  onNext: () => void;
}

const buttonStyle: React.CSSProperties = {
  padding: "9px 18px",
  fontSize: 13,
  fontWeight: 500,
  color: COLORS.surface,
  background: COLORS.ink,
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

export function StatusBanner({ status, wrongGuesses, onNext }: StatusBannerProps) {
  const isWin = status === "won";
  const guessCount = wrongGuesses + 1;

  return (
    <div style={{ marginBottom: 14 }}>
      <p
        style={{
          color: isWin ? COLORS.correct : COLORS.incorrect,
          fontSize: 14,
          marginBottom: 8,
        }}
      >
        {isWin
          ? `Solved in ${guessCount} guess${guessCount === 1 ? "" : "es"}.`
          : "Out of guesses."}
      </p>
      <button onClick={onNext} style={buttonStyle}>
        {isWin ? "Next card" : "Try another card"}
      </button>
    </div>
  );
}