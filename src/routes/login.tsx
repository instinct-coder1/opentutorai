import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound, LogIn } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";
import AuthCard from "@/components/app/AuthCard";
import Button from "@/components/app/Button";
import FormField, { inputClass } from "@/components/app/FormField";
import Notice from "@/components/app/Notice";
import { useAuth } from "@/hooks/useAuth";
import { safeRedirectPath } from "@/lib/redirects";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in - OpenTutor AI" },
      { name: "description", content: "Sign in to continue learning with OpenTutor AI." },
      { property: "og:title", content: "Sign in - OpenTutor AI" },
      { property: "og:description", content: "Sign in to continue learning with OpenTutor AI." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const destination = safeRedirectPath(redirect);
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ href: destination, replace: true });
  }, [loading, user, destination, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate({ href: destination, replace: true });
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to pick up where you left off."
      footer={
        <>
          New to OpenTutor AI?{" "}
          <Link to="/signup" className="font-medium text-primary hover:text-primary-hover">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error ? <Notice tone="error">{error}</Notice> : null}
        <FormField label="Email" htmlFor={emailId}>
          <input
            id={emailId}
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>
        <FormField label="Password" htmlFor={passwordId}>
          <input
            id={passwordId}
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormField>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={submitting}
          icon={<LogIn className="h-4 w-4" aria-hidden="true" />}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-border bg-muted p-4">
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Forgot your password, or had an account before?</p>
            <p className="mt-1 text-subtle-foreground">
              We've moved to a new home. Existing learners keep their profile — just confirm your
              email and choose a new password.
            </p>
            <Link
              to="/forgot-password"
              className="mt-2 inline-block font-medium text-primary hover:text-primary-hover"
            >
              Set a new password
            </Link>
          </div>
        </div>
      </div>
    </AuthCard>
  );
}
