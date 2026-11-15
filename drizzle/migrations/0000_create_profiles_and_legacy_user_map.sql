CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text CHECK (display_name IS NULL OR char_length(display_name) <= 80),
  learner_type text CHECK (learner_type IS NULL OR learner_type IN ('school', 'university', 'professional', 'independent', 'research', 'career_explorer')),
  age_range text CHECK (age_range IS NULL OR age_range IN ('under_13', '13_17', '18_24', '25_34', '35_44', '45_plus', 'prefer_not_to_say')),
  country text CHECK (country IS NULL OR char_length(country) <= 80),
  preferred_language text CHECK (preferred_language IS NULL OR char_length(preferred_language) <= 40),
  education_level text CHECK (education_level IS NULL OR char_length(education_level) <= 80),
  curriculum text CHECK (curriculum IS NULL OR char_length(curriculum) <= 80),
  subjects text[] NOT NULL DEFAULT '{}',
  learning_goal text CHECK (learning_goal IS NULL OR char_length(learning_goal) <= 500),
  self_assessed_level text CHECK (self_assessed_level IS NULL OR self_assessed_level IN ('beginner', 'intermediate', 'advanced')),
  weekly_study_minutes integer CHECK (weekly_study_minutes IS NULL OR (weekly_study_minutes >= 0 AND weekly_study_minutes <= 10080)),
  target_date date,
  learning_style text CHECK (learning_style IS NULL OR learning_style IN ('visual', 'reading', 'hands_on', 'discussion', 'mixed')),
  previous_experience text CHECK (previous_experience IS NULL OR char_length(previous_experience) <= 500),
  onboarding_step integer NOT NULL DEFAULT 0 CHECK (onboarding_step >= 0 AND onboarding_step <= 3),
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
REVOKE ALL ON public.profiles FROM anon;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Server-only mapping from original (Bolt) user ids to Lovable Cloud auth ids.
CREATE TABLE IF NOT EXISTS public.legacy_user_map (
  original_user_id uuid PRIMARY KEY,
  auth_user_id uuid UNIQUE,
  email text NOT NULL UNIQUE,
  imported_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz
);

GRANT ALL ON public.legacy_user_map TO service_role;
REVOKE ALL ON public.legacy_user_map FROM anon, authenticated;

ALTER TABLE public.legacy_user_map ENABLE ROW LEVEL SECURITY;