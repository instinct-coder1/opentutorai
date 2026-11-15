import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";
import AuthCard from "@/components/app/AuthCard";
import Button from "@/components/app/Button";
import FormField, { inputClass } from "@/components/app/FormField";
import Notice from "@/components/app/Notice";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account - OpenTutor AI" },
      {
        name: "description",
        content: "Create a free OpenTutor AI account and build your personal learning profile.",
      },
      { property: "og:title", content: "Create your account - OpenTutor AI" },
      {
        property: "og:description",
        content: "Create a free OpenTutor AI account and build your personal learning profile.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { user, loading, signUp } = useAuth();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/app/onboarding", replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await signUp(email.trim(), password, name.trim());
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsConfirmation) {
      setSentTo(email.trim());
      return;
    }
    navigate({ to: "/app/onboarding", replace: true });
  }

  if (sentTo) {
    return (
      <AuthCard title="Check your inbox" description="One more step to start learning.">
        <Notice tone="success">
          We sent a confirmation link to <strong>{sentTo}</strong>. Open it to activate your
          account, then you'll set up your learning profile.
        </Notice>
        <p className="mt-6 text-sm text-subtle-foreground">
          Already confirmed?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
            Sign in
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      description="It takes about two minutes to build your learning profile."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error ? <Notice tone="error">{error}</Notice> : null}
        <FormField label="What should we call you?" htmlFor={nameId}>
          <input
            id={nameId}
            type="text"
            autoComplete="given-name"
            maxLength={60}
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your first name or nickname"
          />
        </FormField>
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
        <FormField label="Password" htmlFor={passwordId} hint="At least 6 characters.">
          <input
            id={passwordId}
            type="password"
            autoComplete="new-password"
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
          icon={<UserPlus className="h-4 w-4" aria-hidden="true" />}
        >
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
