import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, ProfileAnswers } from "@/features/profile/options";

const PROFILE_COLUMNS =
  "id, display_name, learner_type, age_range, country, preferred_language, education_level, curriculum, subjects, learning_goal, self_assessed_level, weekly_study_minutes, target_date, target_exam, learning_style, previous_experience, onboarding_step, onboarding_completed_at";

function blankToNull(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Profile | null) ?? null;
}

export const profileQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId),
  });

export async function saveProfileProgress(
  userId: string,
  answers: ProfileAnswers,
  step: number,
  completed: boolean,
): Promise<Profile> {
  const row = {
    id: userId,
    display_name: blankToNull(answers.display_name),
    learner_type: answers.learner_type,
    age_range: answers.age_range,
    country: blankToNull(answers.country),
    preferred_language: blankToNull(answers.preferred_language),
    education_level: answers.education_level,
    curriculum: blankToNull(answers.curriculum),
    subjects: answers.subjects,
    learning_goal: blankToNull(answers.learning_goal),
    self_assessed_level: answers.self_assessed_level,
    weekly_study_minutes: answers.weekly_study_minutes,
    target_date: answers.target_date || null,
    target_exam: blankToNull(answers.target_exam),
    learning_style: answers.learning_style,
    previous_experience: blankToNull(answers.previous_experience),
    onboarding_step: step,
    onboarding_completed_at: completed ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(row, { onConflict: "id" })
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Your progress could not be saved. Please try again.");
  return data as Profile;
}
