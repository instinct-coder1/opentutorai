import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Clock, Compass, Pencil, Sparkles, Target } from "lucide-react";
import type { ReactNode } from "react";
import { buttonClass } from "@/components/app/Button";
import {
  ageRangeLabel,
  formatTargetDate,
  learnerTypeLabel,
  learningStyleLabel,
  levelLabel,
  weeklyMinutesLabel,
} from "@/features/profile/labels";
import { profileQueryOptions } from "@/features/profile/profileService";

export const Route = createFileRoute("/_authenticated/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard - OpenTutor AI" },
      { name: "description", content: "Your learning profile and goals at a glance." },
      { property: "og:title", content: "Dashboard - OpenTutor AI" },
      { property: "og:description", content: "Your learning profile and goals at a glance." },
    ],
  }),
  loader: async ({ context }) => {
    const profile = await context.queryClient.ensureQueryData(
      profileQueryOptions(context.user.id),
    );
    if (!profile?.onboarding_completed_at) {
      throw redirect({ to: "/app/onboarding", replace: true });
    }
  },
  component: DashboardPage,
});

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value ?? "Not set"}</dd>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
          {icon}
        </span>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const { data: profile } = useSuspenseQuery(profileQueryOptions(user.id));
  if (!profile) return null;

  const name = profile.display_name ?? "there";

  return (
    <div className="animate-fade-in space-y-8">
      <div className="overflow-hidden rounded-2xl bg-navy p-8 text-navy-foreground shadow-soft sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-navy-muted">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Your learning profile is ready
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome, {name}
            </h1>
            {profile.learning_goal ? (
              <p className="mt-3 max-w-xl text-navy-muted">“{profile.learning_goal}”</p>
            ) : (
              <p className="mt-3 max-w-xl text-navy-muted">
                Add a learning goal to keep your mentor focused on what matters to you.
              </p>
            )}
          </div>
          <Link to="/app/onboarding" className={buttonClass("secondary")}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit profile
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-navy-raised px-4 py-3">
            <p className="flex items-center gap-2 text-xs text-navy-muted">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Weekly study time
            </p>
            <p className="mt-1 font-semibold">
              {weeklyMinutesLabel(profile.weekly_study_minutes) ?? "Not set"}
            </p>
          </div>
          <div className="rounded-xl bg-navy-raised px-4 py-3">
            <p className="flex items-center gap-2 text-xs text-navy-muted">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Target date
            </p>
            <p className="mt-1 font-semibold">{formatTargetDate(profile.target_date) ?? "Not set"}</p>
          </div>
          <div className="rounded-xl bg-navy-raised px-4 py-3">
            <p className="flex items-center gap-2 text-xs text-navy-muted">
              <Target className="h-3.5 w-3.5" aria-hidden="true" /> Current level
            </p>
            <p className="mt-1 font-semibold">
              {levelLabel(profile.self_assessed_level) ?? "Not set"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="About you" icon={<Compass className="h-4 w-4" aria-hidden="true" />}>
          <dl className="grid gap-4">
            <Detail label="Learner type" value={learnerTypeLabel(profile.learner_type)} />
            <Detail label="Age range" value={ageRangeLabel(profile.age_range)} />
            <Detail label="Country" value={profile.country} />
            <Detail label="Preferred language" value={profile.preferred_language} />
          </dl>
        </Panel>

        <Panel title="Education" icon={<BookOpen className="h-4 w-4" aria-hidden="true" />}>
          <dl className="grid gap-4">
            <Detail label="Education level" value={profile.education_level} />
            <Detail label="Curriculum" value={profile.curriculum} />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Subjects
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {profile.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full border border-brand-soft bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                  >
                    {subject}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel title="How you learn" icon={<Target className="h-4 w-4" aria-hidden="true" />}>
          <dl className="grid gap-4">
            <Detail label="Learning style" value={learningStyleLabel(profile.learning_style)} />
            <Detail label="Target exam" value={profile.target_exam} />
            <Detail label="Relevant experience" value={profile.previous_experience} />
          </dl>
        </Panel>
      </div>
    </div>
  );
}
