import React, { useEffect, useRef, useState } from "react";
import { COLORS } from "../theme";
import type { Settings as SettingsValue } from "../hooks/useSettings";

interface SettingsProps {
  settings: SettingsValue;
  onChange: (patch: Partial<SettingsValue>) => void;
}

interface YearBounds {
  min: number;
  max: number;
}

const checkboxRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  color: COLORS.ink,
  marginBottom: 10,
  cursor: "pointer",
};

export function Settings({ settings, onChange }: SettingsProps) {
  const [open, setOpen] = useState(false);
  const [bounds, setBounds] = useState<YearBounds | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/cards/year-range")
      .then((res) => res.json())
      .then((data: YearBounds) => setBounds(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const yearStart = settings.yearStart ?? bounds?.min ?? 1993;
  const yearEnd = settings.yearEnd ?? bounds?.max ?? yearStart;
  const span = bounds ? bounds.max - bounds.min || 1 : 1;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="Settings"
        title="Settings"
        style={{
          width: 36,
          height: 36,
          fontSize: 16,
          color: COLORS.ink,
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        ⚙
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 260,
            padding: 16,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            zIndex: 20,
            textAlign: "left",
          }}
        >
          <label style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={settings.excludeUniversesBeyond}
              onChange={(e) => onChange({ excludeUniversesBeyond: e.target.checked })}
            />
            Exclude Universes Beyond
          </label>

          <label style={{ ...checkboxRowStyle, marginBottom: bounds ? 14 : 0 }}>
            <input
              type="checkbox"
              checked={settings.excludeSecretLair}
              onChange={(e) => onChange({ excludeSecretLair: e.target.checked })}
            />
            Exclude Secret Lair
          </label>

          <label style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={settings.excludeNonBooster}
              onChange={(e) => onChange({ excludeNonBooster: e.target.checked })}
            />
            Exclude non-booster prints
          </label>

          <label style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={settings.onlyFirstPrinting}
              onChange={(e) => onChange({ onlyFirstPrinting: e.target.checked })}
            />
            Only first printing
          </label>

          {bounds && (
            <div>
              <p style={{ fontSize: 12, color: COLORS.secondary, marginBottom: 8 }}>
                Printing year: {yearStart}–{yearEnd}
              </p>
              <div className="year-range-slider" style={{ position: "relative", height: 24 }}>
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 0,
                    right: 0,
                    height: 4,
                    borderRadius: 2,
                    background: COLORS.border,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    height: 4,
                    borderRadius: 2,
                    background: COLORS.ink,
                    left: `${((yearStart - bounds.min) / span) * 100}%`,
                    right: `${100 - ((yearEnd - bounds.min) / span) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min={bounds.min}
                  max={bounds.max}
                  value={yearStart}
                  style={{
                    zIndex: 1,
                    // when both handles land on the same value they'd otherwise sit at
                    // the exact same pixel, and the higher z-index handle would eat every
                    // click — nudge them apart visually (not their real values) so both
                    // stay independently draggable right at the collapse point.
                    transform: yearStart === yearEnd ? "translateX(-5px)" : undefined,
                  }}
                  onChange={(e) => {
                    const value = Math.min(Number(e.target.value), yearEnd);
                    onChange({ yearStart: value === bounds.min ? null : value });
                  }}
                />
                <input
                  type="range"
                  min={bounds.min}
                  max={bounds.max}
                  value={yearEnd}
                  style={{
                    zIndex: 2,
                    transform: yearStart === yearEnd ? "translateX(5px)" : undefined,
                  }}
                  onChange={(e) => {
                    const value = Math.max(Number(e.target.value), yearStart);
                    onChange({ yearEnd: value === bounds.max ? null : value });
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: COLORS.muted,
                  marginTop: 2,
                }}
              >
                <span>{bounds.min}</span>
                <span>{bounds.max}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
