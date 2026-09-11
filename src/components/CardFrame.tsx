import React from "react";
import { COLORS } from "../theme";
import type { Card, GameStatus } from "../types";

interface CardFrameProps {
  card: Card;
  status: GameStatus;
}

export function CardFrame({ card, status }: CardFrameProps) {
  const revealed = status === "won" || status === "lost";

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "63 / 88",
        maxWidth: 220,
        margin: "0 auto 32px",
        borderRadius: 6,
        border: `1px solid ${COLORS.borderStrong}`,
        background: COLORS.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {revealed ? (
        <p
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: status === "won" ? COLORS.correct : COLORS.incorrect,
            textAlign: "center",
            padding: 16,
            margin: 0,
          }}
        >
          {card.name}
        </p>
      ) : (
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>card image</p>
      )}
    </div>
  );
}