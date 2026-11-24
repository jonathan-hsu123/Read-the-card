import { describe, expect, it } from "vitest";
import { buildRandomUrl } from "./useTriviaGame";
import type { Settings } from "./useSettings";

const defaults: Settings = {
  excludeUniversesBeyond: false,
  excludeNonBooster: false,
  onlyFirstPrinting: false,
  excludeSecretLair: false,
  yearStart: null,
  yearEnd: null,
};

describe("buildRandomUrl", () => {
  it("has no query string with default settings", () => {
    expect(buildRandomUrl(defaults)).toBe("/api/cards/random");
  });

  it("includes every enabled filter", () => {
    const url = new URL(
      buildRandomUrl({
        excludeUniversesBeyond: true,
        excludeNonBooster: true,
        onlyFirstPrinting: true,
        excludeSecretLair: true,
        yearStart: 2000,
        yearEnd: 2010,
      }),
      "http://localhost",
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      excludeUniversesBeyond: "true",
      excludeNonBooster: "true",
      onlyFirstPrinting: "true",
      excludeSecretLair: "true",
      yearStart: "2000",
      yearEnd: "2010",
    });
  });
});
