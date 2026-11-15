import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/app/Button';
import Notice from '@/components/app/Notice';
import StepAboutYou from '@/features/onboarding/StepAboutYou';
import {
  validateAboutYou,
  validateEducation,
  validateGoals,
  type StepErrors,
} from '@/features/onboarding/validation';
import StepEducation from '@/features/onboarding/StepEducation';
import StepGoals from '@/features/onboarding/StepGoals';
import { saveProfileProgress } from '@/features/profile/profileService';
import {
  TOTAL_ONBOARDING_STEPS,
  type ProfileAnswers,
} from '@/features/profile/options';

interface WizardProps {
  userId: string;
  initialAnswers: ProfileAnswers;
  initialStep: number;
  alreadyCompleted: boolean;
}

const STEPS = [
  {
    title: 'Tell us about you',
    description: 'The basics help us shape the way you learn.',
    validate: validateAboutYou,
  },
  {
    title: 'Your education',
    description: 'Where you are today and what you want to learn.',
    validate: validateEducation,
  },
  {
    title: 'Your goals',
    description: 'What success looks like and how you like to study.',
    validate: validateGoals,
  },
];

const STEP_COMPONENTS = [StepAboutYou, StepEducation, StepGoals];

export default function OnboardingWizard({
  userId,
  initialAnswers,
  initialStep,
  alreadyCompleted,
}: WizardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(initialStep);
  const [answers, setAnswers] = useState<ProfileAnswers>(initialAnswers);
  const [errors, setErrors] = useState<StepErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isLastStep = step === TOTAL_ONBOARDING_STEPS - 1;
  const StepComponent = STEP_COMPONENTS[step];
  const current = STEPS[step];

  function updateAnswer<K extends keyof ProfileAnswers>(key: K, value: ProfileAnswers[K]) {
    setAnswers((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  async function handleNext() {
    const stepErrors = current.validate(answers);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const nextStep = isLastStep ? TOTAL_ONBOARDING_STEPS : step + 1;
      const completed = isLastStep || alreadyCompleted;
      const saved = await saveProfileProgress(userId, answers, nextStep, completed);
      queryClient.setQueryData(['profile', userId], saved);
      if (isLastStep) {
        navigate({ to: '/app/dashboard', replace: true });
        return;
      }
      setStep(nextStep);
    } catch {
      setSaveError('We could not save your progress. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-primary">
              Step {step + 1} of {TOTAL_ONBOARDING_STEPS}
            </span>
            <span className="text-muted-foreground">{alreadyCompleted ? 'Editing your profile' : 'Saved as you go'}</span>
          </div>
          <div className="flex gap-2" aria-hidden="true">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  index <= step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold leading-tight text-foreground">{current.title}</h2>
          <p className="mt-1.5 text-subtle-foreground">{current.description}</p>
        </div>

        <div key={step} className="mt-8 animate-fade-in">
          <StepComponent answers={answers} errors={errors} onChange={updateAnswer} />
        </div>

        {saveError ? (
          <div className="mt-6">
            <Notice tone="error">{saveError}</Notice>
          </div>
        ) : null}

        <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
          <Button
            variant="ghost"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0 || saving}
            icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            loading={saving}
            icon={isLastStep ? <Check className="h-4 w-4" aria-hidden="true" /> : undefined}
          >
            {isLastStep ? (alreadyCompleted ? 'Save changes' : 'Finish setup') : 'Save and continue'}
            {!isLastStep ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
          </Button>
        </div>
      </div>
    </div>
  );
}
