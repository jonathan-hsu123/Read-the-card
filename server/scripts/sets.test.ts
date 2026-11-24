import { describe, expect, it } from "vitest";
import { findSecretLairSetCodes } from "./sets.js";

describe("findSecretLairSetCodes", () => {
  it("includes sld and every set descending from it", () => {
    const codes = findSecretLairSetCodes([
      { code: "sld" },
      { code: "slc", parent_set_code: "sld" },
      { code: "pssc", parent_set_code: "sld" },
      { code: "child", parent_set_code: "slc" },
      { code: "slz" },
      { code: "lea" },
      { code: "plea", parent_set_code: "lea" },
    ]);
    expect([...codes].sort()).toEqual(["child", "pssc", "slc", "sld"]);
  });

  it("stops on parent cycles", () => {
    expect(findSecretLairSetCodes([
      { code: "a", parent_set_code: "b" },
      { code: "b", parent_set_code: "a" },
    ]).size).toBe(0);
  });
});
