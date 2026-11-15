import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";
import AuthCard from "@/components/app/AuthCard";
import Button from "@/components/app/Button";
import FormField, { inputClass } from "@/components/app/FormField";
import Notice from "@/components/app/Notice";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password - OpenTutor AI" },
      { name: "description", content: "Choose a new password for your OpenTutor AI account." },
      { property: "og:title", content: "Choose a new password - OpenTutor AI" },
      {
        property: "og:description",
        content: "Choose a new password for your OpenTutor AI account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading, updatePassword } = useAuth();
  const passwordId = useId();
  const confirmId = useId();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecoveryLink, setIsRecoveryLink] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    setIsRecoveryLink(hash.includes("type=recovery") || search.includes("code="));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await updatePassword(password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate({ to: "/app/dashboard", replace: true });
  }

  if (!loading && !session && !isRecoveryLink) {
    return (
      <AuthCard
        title="This link has expired"
        description="Password links can only be used once and expire after a while."
      >
        <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-hover">
          Send me a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      description="Your email is confirmed. Pick a password you'll use to sign in from now on."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error ? <Notice tone="error">{error}</Notice> : null}
        <FormField label="New password" htmlFor={passwordId} hint="At least 6 characters.">
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
        <FormField label="Confirm new password" htmlFor={confirmId}>
          <input
            id={confirmId}
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </FormField>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={submitting}
          disabled={loading || !session}
          icon={<Check className="h-4 w-4" aria-hidden="true" />}
        >
          Save password
        </Button>
      </form>
    </AuthCard>
  );
}
