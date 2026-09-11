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
        aspectRatio: "5 / 4",
        maxWidth: 320,
        margin: "0 auto 16px",
        borderRadius: 6,
        border: `1px solid ${COLORS.borderStrong}`,
        background: COLORS.surface,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <img
        src={card.imageUrl}
        alt="Mystery card"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {revealed && (
        <p
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            fontSize: 16,
            fontWeight: 500,
            color: status === "won" ? COLORS.correct : COLORS.incorrect,
            textAlign: "center",
            padding: 12,
            margin: 0,
            background: "rgba(12, 10, 9, 0.85)",
          }}
        >
          {card.name}
        </p>
      )}
    </div>
  );
}