import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { tutorModeLabel } from "@/features/tutor/modes";
import { conversationsQueryOptions, deleteConversation } from "@/features/tutor/tutorService";

export const Route = createFileRoute("/_authenticated/app/tutor")({
  head: () => ({
    meta: [
      { title: "AI Tutor - OpenTutor AI" },
      {
        name: "description",
        content: "Learn with a patient AI tutor that adapts to your level and goals.",
      },
      { property: "og:title", content: "AI Tutor - OpenTutor AI" },
      {
        property: "og:description",
        content: "Learn with a patient AI tutor that adapts to your level and goals.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(conversationsQueryOptions(context.user.id)),
  component: TutorLayout,
});

function TutorLayout() {
  const { user } = Route.useRouteContext();
  const { data: conversations = [] } = useQuery(conversationsQueryOptions(user.id));
  const params = useParams({ strict: false }) as { conversationId?: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this conversation? This can't be undone.")) return;
    try {
      await deleteConversation(id);
      await queryClient.invalidateQueries({ queryKey: ["tutor", "conversations", user.id] });
      queryClient.removeQueries({ queryKey: ["tutor", "conversation", id] });
      if (params.conversationId === id) navigate({ to: "/app/tutor", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete this conversation.");
    }
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] lg:h-dvh">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="p-4">
          <Link
            to="/app/tutor"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            New conversation
          </Link>
        </div>
        <nav aria-label="Conversations" className="flex-1 overflow-y-auto px-2 pb-4">
          {conversations.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">
              Your conversations will appear here.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((conversation) => {
                const active = params.conversationId === conversation.id;
                return (
                  <li
                    key={conversation.id}
                    className={`group flex items-center rounded-lg ${active ? "bg-accent" : "hover:bg-muted"}`}
                  >
                    <Link
                      to="/app/tutor/$conversationId"
                      params={{ conversationId: conversation.id }}
                      className="min-w-0 flex-1 px-3 py-2.5"
                    >
                      <span
                        className={`block truncate text-sm font-medium ${active ? "text-accent-foreground" : "text-foreground"}`}
                      >
                        {conversation.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {tutorModeLabel(conversation.mode)}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(conversation.id)}
                      aria-label={`Delete conversation: ${conversation.title}`}
                      className="mr-1 rounded-md p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </section>
    </div>
  );
}
