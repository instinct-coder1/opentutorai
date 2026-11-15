import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Compass, Target } from "lucide-react";
import BrandMark from "@/components/app/BrandMark";
import { buttonClass } from "@/components/app/Button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpenTutor AI - Your personal learning mentor" },
      {
        name: "description",
        content:
          "OpenTutor AI builds a personal learning profile, goals and study plan around you.",
      },
      { property: "og:title", content: "OpenTutor AI - Your personal learning mentor" },
      {
        property: "og:description",
        content:
          "OpenTutor AI builds a personal learning profile, goals and study plan around you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const STEPS = [
  {
    icon: Compass,
    title: "Tell us about you",
    body: "Who you are, where you study and the language you prefer.",
  },
  {
    icon: BookOpen,
    title: "Map your education",
    body: "Pick the subjects you care about and how confident you feel today.",
  },
  {
    icon: Target,
    title: "Set your goals",
    body: "Choose a target, your weekly study time and how you learn best.",
  },
];

function HomePage() {
  const { user, loading } = useAuth();
  const signedIn = !loading && Boolean(user);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-navy text-navy-foreground">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <BrandMark inverted />
          <nav className="flex items-center gap-2">
            {signedIn ? (
              <Link to="/app/dashboard" className={buttonClass("primary")}>
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-navy-foreground transition-colors hover:bg-navy-raised"
                >
                  Sign in
                </Link>
                <Link to="/signup" className={buttonClass("primary")}>
                  Get started
                </Link>
              </>
            )}
          </nav>
        </header>

        <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-20">
          <div className="animate-fade-in">
            <p className="text-sm font-semibold uppercase tracking-widest text-navy-muted">
              Your personal learning mentor
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Learning that starts with <span className="text-brand-border">who you are.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-navy-muted">
              OpenTutor AI builds a personal learning profile, goals and study plan around you —
              whether you're in school, at university, or growing your career.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to={signedIn ? "/app/dashboard" : "/signup"} className={buttonClass("primary", "lg")}>
                {signedIn ? "Continue learning" : "Build my profile"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {!signedIn ? (
                <Link to="/login" className={buttonClass("secondary", "lg")}>
                  I already have an account
                </Link>
              ) : null}
            </div>
          </div>

          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="rounded-2xl border border-navy-raised bg-navy-raised p-6 shadow-soft">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-brand-border">Step 2 of 3</span>
                <span className="text-navy-muted">Saved as you go</span>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-primary" />
                <div className="h-1.5 flex-1 rounded-full bg-primary" />
                <div className="h-1.5 flex-1 rounded-full bg-navy" />
              </div>
              <p className="mt-6 text-xl font-semibold">Your education</p>
              <p className="mt-1 text-sm text-navy-muted">What do you want to learn about?</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Mathematics", "Data Science", "Physics", "Programming", "Economics", "Psychology"].map(
                  (subject, index) => (
                    <span
                      key={subject}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                        index % 3 === 0
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-navy text-navy-muted"
                      }`}
                    >
                      {subject}
                    </span>
                  ),
                )}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {["Beginner", "Intermediate", "Advanced"].map((level, index) => (
                  <div
                    key={level}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                      index === 1 ? "border-primary bg-navy ring-1 ring-primary" : "border-navy"
                    }`}
                  >
                    {level}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Three short steps to a plan that fits
        </h2>
        <p className="mt-2 max-w-2xl text-subtle-foreground">
          Answer a few questions once. Your mentor uses them to shape every lesson.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, index) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm text-subtle-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <BrandMark />
          <span>© {new Date().getFullYear()} OpenTutor AI</span>
        </div>
      </footer>
    </div>
  );
}
