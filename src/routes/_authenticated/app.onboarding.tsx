import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import OnboardingWizard from "@/features/onboarding/OnboardingWizard";
import { answersFromProfile } from "@/features/profile/answers";
import { TOTAL_ONBOARDING_STEPS } from "@/features/profile/options";
import { profileQueryOptions } from "@/features/profile/profileService";

export const Route = createFileRoute("/_authenticated/app/onboarding")({
  head: () => ({
    meta: [
      { title: "Your learning profile - OpenTutor AI" },
      {
        name: "description",
        content: "Tell OpenTutor AI about yourself, your education and your goals.",
      },
      { property: "og:title", content: "Your learning profile - OpenTutor AI" },
      {
        property: "og:description",
        content: "Tell OpenTutor AI about yourself, your education and your goals.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQueryOptions(context.user.id)),
  component: OnboardingPage,
});

function OnboardingPage() {
  const { user } = Route.useRouteContext();
  const { data: profile } = useSuspenseQuery(profileQueryOptions(user.id));
  const alreadyCompleted = Boolean(profile?.onboarding_completed_at);
  const fallbackName =
    typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "";
  const initialStep = alreadyCompleted
    ? 0
    : Math.min(profile?.onboarding_step ?? 0, TOTAL_ONBOARDING_STEPS - 1);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {alreadyCompleted ? "Learning profile" : "Getting started"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          {alreadyCompleted ? "Update your learning profile" : "Let's build your learning profile"}
        </h1>
        <p className="mt-2 text-subtle-foreground">
          A few questions so your mentor can shape lessons around you. Your answers save at every
          step.
        </p>
      </div>
      <OnboardingWizard
        userId={user.id}
        initialAnswers={answersFromProfile(profile, fallbackName)}
        initialStep={initialStep}
        alreadyCompleted={alreadyCompleted}
      />
    </div>
  );
}
