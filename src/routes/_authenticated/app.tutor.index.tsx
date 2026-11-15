import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TutorAvatar from "@/components/app/TutorAvatar";
import { TUTOR_MODES, tutorModeLabel, type TutorMode } from "@/features/tutor/modes";
import { conversationsQueryOptions, createConversation } from "@/features/tutor/tutorService";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/app/tutor/")({
  component: TutorHome,
});

function TutorHome() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: conversations = [] } = useQuery(conversationsQueryOptions(user.id));
  const [creating, setCreating] = useState<TutorMode | null>(null);

  async function start(mode: TutorMode) {
    setCreating(mode);
    try {
      const id = await createConversation(mode);
      await queryClient.invalidateQueries({ queryKey: ["tutor", "conversations", user.id] });
      navigate({ to: "/app/tutor/$conversationId", params: { conversationId: id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start a conversation.");
      setCreating(null);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4">
          <TutorAvatar size={56} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Your AI tutor
            </h1>
            <p className="mt-1 text-subtle-foreground">
              Pick how you'd like to learn. Your tutor knows your profile and adapts to your level.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {TUTOR_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => start(mode.value)}
              disabled={creating !== null}
              className="group flex flex-col items-start rounded-xl border border-border bg-card p-5 text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-border disabled:cursor-wait disabled:opacity-70"
            >
              <span className="flex w-full items-center justify-between text-base font-semibold text-foreground">
                {mode.label}
                <ArrowRight
                  className={`h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 ${creating === mode.value ? "animate-pulse" : ""}`}
                  aria-hidden="true"
                />
              </span>
              <span className="mt-1 text-sm text-subtle-foreground">{mode.description}</span>
            </button>
          ))}
        </div>

        {conversations.length > 0 ? (
          <div className="mt-10 md:hidden">
            <h2 className="text-sm font-semibold text-foreground">Recent conversations</h2>
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
              {conversations.slice(0, 10).map((conversation) => (
                <li key={conversation.id}>
                  <Link
                    to="/app/tutor/$conversationId"
                    params={{ conversationId: conversation.id }}
                    className="block px-4 py-3"
                  >
                    <span className="block truncate text-sm font-medium text-foreground">
                      {conversation.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {tutorModeLabel(conversation.mode)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-10 text-xs text-muted-foreground">
          AI-powered answers can be wrong. Check important facts with your teacher or official
          sources.
        </p>
      </div>
    </div>
  );
}
