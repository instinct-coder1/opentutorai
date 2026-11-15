import { useId } from 'react';
import FormField, { inputClass } from '@/components/app/FormField';
import ChoiceGroup from '@/components/app/ChoiceGroup';
import {
  LEARNING_STYLES,
  WEEKLY_MINUTE_OPTIONS,
  type LearningStyle,
  type ProfileAnswers,
} from '@/features/profile/options';
import type { StepErrors } from '@/features/onboarding/StepAboutYou';

interface StepProps {
  answers: ProfileAnswers;
  errors: StepErrors;
  onChange: <K extends keyof ProfileAnswers>(key: K, value: ProfileAnswers[K]) => void;
}

export default function StepGoals({ answers, errors, onChange }: StepProps) {
  const goalId = useId();
  const minutesId = useId();
  const dateId = useId();
  const experienceId = useId();
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <FormField
        label="What is your main learning goal?"
        htmlFor={goalId}
        hint="Optional. A sentence or two is plenty."
      >
        <textarea
          id={goalId}
          rows={3}
          maxLength={500}
          className={inputClass}
          value={answers.learning_goal ?? ''}
          onChange={(event) => onChange('learning_goal', event.target.value)}
          placeholder="For example, pass my statistics exam or learn Python for my data job"
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Weekly study time" htmlFor={minutesId}>
          <select
            id={minutesId}
            className={inputClass}
            value={answers.weekly_study_minutes ?? ''}
            onChange={(event) =>
              onChange('weekly_study_minutes', event.target.value ? Number(event.target.value) : null)
            }
          >
            <option value="">Select an amount</option>
            {WEEKLY_MINUTE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Target date" htmlFor={dateId} hint="Optional. When would you like to reach your goal?">
          <input
            id={dateId}
            type="date"
            min={todayIso}
            className={inputClass}
            value={answers.target_date ?? ''}
            onChange={(event) => onChange('target_date', event.target.value || null)}
          />
        </FormField>
      </div>

      <ChoiceGroup<LearningStyle>
        label="How do you learn best?"
        options={LEARNING_STYLES}
        value={answers.learning_style}
        onChange={(value) => onChange('learning_style', value)}
        error={errors.learning_style}
        columns={3}
      />

      <FormField
        label="Relevant experience"
        htmlFor={experienceId}
        hint="Optional. Anything you have already studied or done in this area."
      >
        <textarea
          id={experienceId}
          rows={3}
          maxLength={500}
          className={inputClass}
          value={answers.previous_experience ?? ''}
          onChange={(event) => onChange('previous_experience', event.target.value)}
        />
      </FormField>
    </div>
  );
}
