import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import AuthCard from "@/components/app/AuthCard";
import Button from "@/components/app/Button";
import FormField, { inputClass } from "@/components/app/FormField";
import Notice from "@/components/app/Notice";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Set a new password - OpenTutor AI" },
      {
        name: "description",
        content: "Confirm your email and choose a new password for your OpenTutor AI account.",
      },
      { property: "og:title", content: "Set a new password - OpenTutor AI" },
      {
        property: "og:description",
        content: "Confirm your email and choose a new password for your OpenTutor AI account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { requestPasswordSetup } = useAuth();
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Enter the email you use for OpenTutor AI.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await requestPasswordSetup(email.trim());
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSentTo(email.trim());
  }

  return (
    <AuthCard
      title="Set a new password"
      description="We'll email you a secure link to confirm it's you and choose a new password."
      footer={
        <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
          Back to sign in
        </Link>
      }
    >
      {sentTo ? (
        <Notice tone="success">
          If <strong>{sentTo}</strong> has an account, a link to set your password is on its way.
          It may take a minute — check your spam folder too.
        </Notice>
      ) : (
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
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={submitting}
            icon={<Mail className="h-4 w-4" aria-hidden="true" />}
          >
            Email me a link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
