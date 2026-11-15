import { describe, expect, it } from "vitest";
import { validateAboutYou, validateEducation, validateGoals } from "@/features/onboarding/validation";
import { EMPTY_ANSWERS } from "@/features/profile/options";

describe("onboarding step rules", () => {
  it("requires a learner type on step 1", () => {
    expect(validateAboutYou(EMPTY_ANSWERS).learner_type).toBeDefined();
    expect(validateAboutYou({ ...EMPTY_ANSWERS, learner_type: "school" })).toEqual({});
  });

  it("requires at least one subject and a level on step 2", () => {
    const errors = validateEducation(EMPTY_ANSWERS);
    expect(errors.subjects).toBeDefined();
    expect(errors.self_assessed_level).toBeDefined();
    expect(
      validateEducation({ ...EMPTY_ANSWERS, subjects: ["Physics"], self_assessed_level: "beginner" }),
    ).toEqual({});
  });

  it("requires a learning style on step 3", () => {
    expect(validateGoals(EMPTY_ANSWERS).learning_style).toBeDefined();
    expect(validateGoals({ ...EMPTY_ANSWERS, learning_style: "visual" })).toEqual({});
  });
});
