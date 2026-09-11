import React from "react";
import { COLORS } from "../theme";

interface GuessInputProps {
  value: string;
  suggestions: string[];
  showSuggestions: boolean;
  wrongGuesses: number;
  maxGuesses: number;
  guessesLeft: number;
  onChange: (value: string) => void;
  onFocus: () => void;
  onSelect: (name: string) => void;
}

export function GuessInput({
  value,
  suggestions,
  showSuggestions,
  wrongGuesses,
  maxGuesses,
  guessesLeft,
  onChange,
  onFocus,
  onSelect,
}: GuessInputProps) {
  return (
    <>
      <p style={{ color: COLORS.secondary, fontSize: 13, marginBottom: 6 }}>
        Guess {wrongGuesses + 1} of {maxGuesses} — {guessesLeft} left
      </p>

      <div style={{ position: "relative", marginBottom: 14 }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder="Type a card name"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            fontSize: 14,
            color: COLORS.ink,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            outline: "none",
          }}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              overflow: "hidden",
              zIndex: 10,
            }}
          >
            {suggestions.map((name) => (
              <button
                key={name}
                onClick={() => onSelect(name)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  background: "transparent",
                  border: "none",
                  color: COLORS.ink,
                  fontSize: 13,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.bg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}