import { useId } from 'react';
import FormField, { inputClass } from '@/components/app/FormField';
import ChoiceGroup from '@/components/app/ChoiceGroup';
import {
  EDUCATION_LEVELS,
  SELF_ASSESSED_LEVELS,
  SUBJECTS,
  type ProfileAnswers,
  type SelfAssessedLevel,
} from '@/features/profile/options';
import type { StepErrors } from '@/features/onboarding/StepAboutYou';

interface StepProps {
  answers: ProfileAnswers;
  errors: StepErrors;
  onChange: <K extends keyof ProfileAnswers>(key: K, value: ProfileAnswers[K]) => void;
}

export default function StepEducation({ answers, errors, onChange }: StepProps) {
  const educationId = useId();
  const curriculumId = useId();

  function toggleSubject(subject: string) {
    const next = answers.subjects.includes(subject)
      ? answers.subjects.filter((item) => item !== subject)
      : [...answers.subjects, subject];
    onChange('subjects', next);
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Current education level" htmlFor={educationId}>
          <select
            id={educationId}
            className={inputClass}
            value={answers.education_level ?? ''}
            onChange={(event) => onChange('education_level', event.target.value || null)}
          >
            <option value="">Select a level</option>
            {EDUCATION_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Curriculum or exam board"
          htmlFor={curriculumId}
          hint="Optional. For example, IB, AP, or a national curriculum."
        >
          <input
            id={curriculumId}
            type="text"
            maxLength={80}
            className={inputClass}
            value={answers.curriculum ?? ''}
            onChange={(event) => onChange('curriculum', event.target.value)}
          />
        </FormField>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm font-medium text-foreground">What do you want to learn about?</p>
          <span className="text-xs text-muted-foreground">{answers.subjects.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Subjects">
          {SUBJECTS.map((subject) => {
            const selected = answers.subjects.includes(subject);
            return (
              <button
                key={subject}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleSubject(subject)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                  selected
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-input bg-card text-subtle-foreground hover:border-brand-border hover:bg-accent'
                }`}
              >
                {subject}
              </button>
            );
          })}
        </div>
        {errors.subjects ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.subjects}
          </p>
        ) : null}
      </div>

      <ChoiceGroup<SelfAssessedLevel>
        label="How would you rate your current level?"
        options={SELF_ASSESSED_LEVELS}
        value={answers.self_assessed_level}
        onChange={(value) => onChange('self_assessed_level', value)}
        error={errors.self_assessed_level}
        columns={3}
      />
    </div>
  );
}
