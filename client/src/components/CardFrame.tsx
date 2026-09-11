import React from "react";
import { COLORS } from "../theme";
import type { Card } from "../types";

interface CardFrameProps {
  card: Card;
  revealed: boolean;
  revealColor: string;
}

export function CardFrame({ card, revealed, revealColor }: CardFrameProps) {
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
            color: revealColor,
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
