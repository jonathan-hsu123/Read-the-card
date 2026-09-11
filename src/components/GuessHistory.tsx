import React from "react";
import { COLORS } from "../theme";
import type { GuessRecord } from "../types";

interface GuessHistoryProps {
  history: GuessRecord[];
}

export function GuessHistory({ history }: GuessHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 6 }}>
      {history.map((guess, i) => (
        <span
          key={`${guess.name}-${i}`}
          style={{
            fontSize: 12,
            padding: "3px 9px",
            borderRadius: 4,
            color: guess.correct ? COLORS.correct : COLORS.muted,
            border: `1px solid ${guess.correct ? COLORS.correct : COLORS.border}`,
          }}
        >
          {guess.name}
        </span>
      ))}
    </div>
  );
}