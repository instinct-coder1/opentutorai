import {
  AGE_RANGES,
  LEARNER_TYPES,
  LEARNING_STYLES,
  SELF_ASSESSED_LEVELS,
  WEEKLY_MINUTE_OPTIONS,
} from "@/features/profile/options";

function labelFrom<T extends string | number>(
  options: readonly { value: T; label: string }[],
  value: T | null,
): string | null {
  if (value === null) return null;
  return options.find((option) => option.value === value)?.label ?? null;
}

export const learnerTypeLabel = (value: string | null) =>
  labelFrom(LEARNER_TYPES as readonly { value: string; label: string }[], value);
export const ageRangeLabel = (value: string | null) =>
  labelFrom(AGE_RANGES as readonly { value: string; label: string }[], value);
export const levelLabel = (value: string | null) =>
  labelFrom(SELF_ASSESSED_LEVELS as readonly { value: string; label: string }[], value);
export const learningStyleLabel = (value: string | null) =>
  labelFrom(LEARNING_STYLES as readonly { value: string; label: string }[], value);
export const weeklyMinutesLabel = (value: number | null) =>
  labelFrom(WEEKLY_MINUTE_OPTIONS as readonly { value: number; label: string }[], value);

export function formatTargetDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
