import { useId } from 'react';
import FormField, { inputClass } from '@/components/app/FormField';
import ChoiceGroup from '@/components/app/ChoiceGroup';
import Notice from '@/components/app/Notice';
import {
  AGE_RANGES,
  LEARNER_TYPES,
  type AgeRange,
  type LearnerType,
  type ProfileAnswers,
} from '@/features/profile/options';

import type { StepErrors } from '@/features/onboarding/validation';
export type { StepErrors };

interface StepProps {
  answers: ProfileAnswers;
  errors: StepErrors;
  onChange: <K extends keyof ProfileAnswers>(key: K, value: ProfileAnswers[K]) => void;
}

export default function StepAboutYou({ answers, errors, onChange }: StepProps) {
  const nameId = useId();
  const countryId = useId();
  const languageId = useId();
  const ageId = useId();

  return (
    <div className="space-y-8">
      <ChoiceGroup<LearnerType>
        label="Which best describes you?"
        options={LEARNER_TYPES}
        value={answers.learner_type}
        onChange={(value) => onChange('learner_type', value)}
        error={errors.learner_type}
        columns={2}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="What should we call you?" htmlFor={nameId}>
          <input
            id={nameId}
            type="text"
            autoComplete="given-name"
            maxLength={60}
            className={inputClass}
            value={answers.display_name ?? ''}
            onChange={(event) => onChange('display_name', event.target.value)}
            placeholder="Your first name or nickname"
          />
        </FormField>

        <FormField label="Age range" htmlFor={ageId} hint="Used to tailor the right learning experience.">
          <select
            id={ageId}
            className={inputClass}
            value={answers.age_range ?? ''}
            onChange={(event) =>
              onChange('age_range', (event.target.value || null) as AgeRange | null)
            }
          >
            <option value="">Select an age range</option>
            {AGE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Country" htmlFor={countryId}>
          <input
            id={countryId}
            type="text"
            autoComplete="country-name"
            maxLength={80}
            className={inputClass}
            value={answers.country ?? ''}
            onChange={(event) => onChange('country', event.target.value)}
            placeholder="For example, Canada"
          />
        </FormField>

        <FormField label="Preferred language" htmlFor={languageId}>
          <input
            id={languageId}
            type="text"
            maxLength={60}
            className={inputClass}
            value={answers.preferred_language ?? ''}
            onChange={(event) => onChange('preferred_language', event.target.value)}
          />
        </FormField>
      </div>

      {answers.age_range === 'under_13' ? (
        <Notice tone="info">Learners under 13 should set up their account with a parent or guardian.</Notice>
      ) : null}
    </div>
  );
}
