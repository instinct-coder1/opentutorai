import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string | undefined;
  error?: string | null | undefined;
  children: ReactNode;
}

export const inputClass =
  "block w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-brand-soft disabled:bg-muted";

export default function FormField({ label, htmlFor, hint, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
