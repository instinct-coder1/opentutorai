import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Home, LogOut, Menu, MessagesSquare, UserRound } from "lucide-react";
import { useState } from "react";
import BrandMark from "@/components/app/BrandMark";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

const NAV = [
  { to: "/app/dashboard", label: "Home", icon: Home },
  { to: "/app/tutor", label: "AI Tutor", icon: MessagesSquare },
  { to: "/app/onboarding", label: "Learning profile", icon: UserRound },
] as const;

const UPCOMING = ["Learn", "Career", "Coding & Projects", "Documents & Research", "AI Agents", "My Progress"];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
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
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link to="/app/dashboard" onClick={onNavigate} aria-label="Go to your dashboard">
          <BrandMark />
        </Link>
      </div>
      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-subtle-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-accent text-accent-foreground hover:bg-accent" }}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
        <div className="pt-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Coming soon
          </p>
          <ul className="mt-2 space-y-0.5" aria-label="Sections coming soon">
            {UPCOMING.map((label) => (
              <li key={label} className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4 opacity-50" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="border-t border-border p-3">
        <p className="truncate px-3 pb-2 text-xs text-muted-foreground">{user.email}</p>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-subtle-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const fullBleed = pathname.startsWith("/app/tutor");

  return (
    <div className="min-h-screen bg-muted lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border bg-card lg:block">
        <SidebarNav />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link to="/app/dashboard" aria-label="Go to your dashboard">
          <BrandMark />
        </Link>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger className="rounded-lg p-2 text-subtle-foreground hover:bg-secondary" aria-label="Open menu">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SidebarNav onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      <main className="min-w-0 flex-1">
        {fullBleed ? (
          <Outlet />
        ) : (
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}
