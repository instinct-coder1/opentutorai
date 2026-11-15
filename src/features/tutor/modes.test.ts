import { describe, expect, it } from "vitest";
import { isTutorMode, titleFromText } from "@/features/tutor/modes";

describe("tutor modes", () => {
  it("accepts only the six tutor modes", () => {
    for (const mode of ["guided", "explain", "hint", "practice", "exam", "coding"]) {
      expect(isTutorMode(mode)).toBe(true);
    }
    expect(isTutorMode("document")).toBe(false);
  });

  it("titles a conversation from the first message, capped at 60 characters", () => {
    expect(titleFromText("  Explain   gravity ")).toBe("Explain gravity");
    expect(titleFromText("x".repeat(100))).toHaveLength(58);
    expect(titleFromText("   ")).toBe("New conversation");
  });
});
