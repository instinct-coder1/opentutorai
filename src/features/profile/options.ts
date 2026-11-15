export const LEARNER_TYPES = [
  { value: 'school', label: 'School learner', description: 'Primary or secondary school' },
  { value: 'university', label: 'University student', description: 'Studying for a degree' },
  { value: 'professional', label: 'Working professional', description: 'Building skills for your job' },
  { value: 'independent', label: 'Independent learner', description: 'Learning for personal growth' },
  { value: 'research', label: 'Researcher', description: 'Academic or applied research' },
  { value: 'career_explorer', label: 'Career explorer', description: 'Deciding what to do next' },
] as const;

export const AGE_RANGES = [
  { value: 'under_13', label: 'Under 13' },
  { value: '13_17', label: '13 to 17' },
  { value: '18_24', label: '18 to 24' },
  { value: '25_34', label: '25 to 34' },
  { value: '35_44', label: '35 to 44' },
  { value: '45_plus', label: '45 or older' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const EDUCATION_LEVELS = [
  'Primary school',
  'Middle school',
  'High school',
  'Undergraduate',
  'Postgraduate',
  'Doctoral or research',
  'Working professional',
  'Self-taught',
  'Other',
] as const;

export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Programming',
  'Artificial Intelligence',
  'Data Science',
  'Engineering',
  'English',
  'Foreign Languages',
  'History',
  'Geography',
  'Economics',
  'Business',
  'Finance',
  'Psychology',
  'Philosophy',
  'Research Methods',
  'Professional Skills',
] as const;

export const SELF_ASSESSED_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to most of this' },
  { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with the basics' },
  { value: 'advanced', label: 'Advanced', description: 'Ready for deep, complex material' },
] as const;

export const WEEKLY_MINUTE_OPTIONS = [
  { value: 30, label: 'About 30 minutes' },
  { value: 60, label: 'About 1 hour' },
  { value: 120, label: 'About 2 hours' },
  { value: 180, label: 'About 3 hours' },
  { value: 300, label: 'About 5 hours or more' },
] as const;

export const LEARNING_STYLES = [
  { value: 'visual', label: 'Visual', description: 'Diagrams, charts, and images' },
  { value: 'reading', label: 'Reading', description: 'Notes, articles, and text' },
  { value: 'hands_on', label: 'Hands-on', description: 'Practice and building things' },
  { value: 'discussion', label: 'Discussion', description: 'Talking ideas through' },
  { value: 'mixed', label: 'A mix', description: 'Whatever suits the topic' },
] as const;

export type LearnerType = (typeof LEARNER_TYPES)[number]['value'];
export type AgeRange = (typeof AGE_RANGES)[number]['value'];
export type SelfAssessedLevel = (typeof SELF_ASSESSED_LEVELS)[number]['value'];
export type LearningStyle = (typeof LEARNING_STYLES)[number]['value'];

export interface Profile {
  id: string;
  display_name: string | null;
  learner_type: LearnerType | null;
  age_range: AgeRange | null;
  country: string | null;
  preferred_language: string | null;
  education_level: string | null;
  curriculum: string | null;
  subjects: string[];
  learning_goal: string | null;
  self_assessed_level: SelfAssessedLevel | null;
  weekly_study_minutes: number | null;
  target_date: string | null;
  learning_style: LearningStyle | null;
  previous_experience: string | null;
  onboarding_step: number;
  onboarding_completed_at: string | null;
}

export type ProfileAnswers = Omit<Profile, 'id' | 'onboarding_step' | 'onboarding_completed_at'>;

export const EMPTY_ANSWERS: ProfileAnswers = {
  display_name: null,
  learner_type: null,
  age_range: null,
  country: null,
  preferred_language: 'English',
  education_level: null,
  curriculum: null,
  subjects: [],
  learning_goal: null,
  self_assessed_level: null,
  weekly_study_minutes: null,
  target_date: null,
  learning_style: null,
  previous_experience: null,
};

export const TOTAL_ONBOARDING_STEPS = 3;
