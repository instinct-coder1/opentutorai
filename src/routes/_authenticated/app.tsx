import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import BrandMark from "@/components/app/BrandMark";
import Button from "@/components/app/Button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-subtle-foreground transition-colors hover:bg-secondary hover:text-foreground";

function AppLayout() {
  const { user } = Route.useRouteContext();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/app/dashboard" aria-label="Go to your dashboard">
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
            <Link
              to="/app/dashboard"
              className={navLinkClass}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              Dashboard
            </Link>
            <Link
              to="/app/onboarding"
              className={navLinkClass}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              Learning profile
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[14rem] truncate text-sm text-muted-foreground md:inline">
              {user.email}
            </span>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              loading={signingOut}
              icon={<LogOut className="h-4 w-4" aria-hidden="true" />}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
