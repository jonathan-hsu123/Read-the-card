import { useEffect, useState } from "react";

export interface Settings {
  excludeUniversesBeyond: boolean;
  excludeNonBooster: boolean;
  onlyFirstPrinting: boolean;
  excludeSecretLair: boolean;
  yearStart: number | null;
  yearEnd: number | null;
}

const STORAGE_KEY = "readthecard-settings";

const DEFAULT_SETTINGS: Settings = {
  excludeUniversesBeyond: false,
  excludeNonBooster: false,
  onlyFirstPrinting: false,
  excludeSecretLair: false,
  yearStart: null,
  yearEnd: null,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export interface UseSettings {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
}

export function useSettings(): UseSettings {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore — settings just won't persist across reloads
    }
  }, [settings]);

  function updateSettings(patch: Partial<Settings>): void {
    setSettings((current) => ({ ...current, ...patch }));
  }

  return { settings, updateSettings };
}
