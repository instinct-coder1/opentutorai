import type { Profile, ProfileAnswers } from '@/features/profile/options';
import { EMPTY_ANSWERS } from '@/features/profile/options';

export function answersFromProfile(profile: Profile | null, fallbackName: string): ProfileAnswers {
  if (!profile) {
    return { ...EMPTY_ANSWERS, display_name: fallbackName };
  }
  return {
    display_name: profile.display_name ?? fallbackName,
    learner_type: profile.learner_type,
    age_range: profile.age_range,
    country: profile.country,
    preferred_language: profile.preferred_language,
    education_level: profile.education_level,
    curriculum: profile.curriculum,
    subjects: profile.subjects ?? [],
    learning_goal: profile.learning_goal,
    self_assessed_level: profile.self_assessed_level,
    weekly_study_minutes: profile.weekly_study_minutes,
    target_date: profile.target_date,
    target_exam: profile.target_exam,
    learning_style: profile.learning_style,
    previous_experience: profile.previous_experience,
  };
}
