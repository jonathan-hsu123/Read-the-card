import React from "react";
import { CLUE_LABELS, getClueValue } from "../data";
import { COLORS } from "../theme";
import type { Card, GameStatus } from "../types";

interface ClueListProps {
  card: Card;
  status: GameStatus;
  revealedCount: number;
}

export function ClueList({ card, status, revealedCount }: ClueListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {CLUE_LABELS.map((label, i) => {
        const revealed = status !== "playing" ? true : i < revealedCount;
        return (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 4px",
              borderBottom: i < CLUE_LABELS.length - 1 ? `1px solid ${COLORS.border}` : "none",
            }}
          >
            <span style={{ fontSize: 13, color: COLORS.secondary }}>{label}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: revealed ? COLORS.ink : COLORS.muted,
              }}
            >
              {revealed ? getClueValue(card, i) : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}