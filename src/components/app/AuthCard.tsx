import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import BrandMark from "@/components/app/BrandMark";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <header className="px-6 py-6">
        <Link to="/" aria-label="OpenTutor AI home">
          <BrandMark />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 sm:pt-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <h1 className="text-2xl font-semibold leading-tight text-foreground">{title}</h1>
            <p className="mt-1.5 text-subtle-foreground">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
          {footer ? <div className="mt-6 text-center text-sm text-subtle-foreground">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
