import type { ProfileAnswers } from "@/features/profile/options";

export type StepErrors = Partial<Record<keyof ProfileAnswers, string>>;

export function validateAboutYou(answers: ProfileAnswers): StepErrors {
  const errors: StepErrors = {};
  if (!answers.learner_type) errors.learner_type = "Choose the option that fits you best.";
  return errors;
}

export function validateEducation(answers: ProfileAnswers): StepErrors {
  const errors: StepErrors = {};
  if (answers.subjects.length === 0) errors.subjects = "Pick at least one subject.";
  if (!answers.self_assessed_level) {
    errors.self_assessed_level = "Choose the level that is closest to you.";
  }
  return errors;
}

export function validateGoals(answers: ProfileAnswers): StepErrors {
  const errors: StepErrors = {};
  if (!answers.learning_style) errors.learning_style = "Choose how you learn best.";
  return errors;
}
