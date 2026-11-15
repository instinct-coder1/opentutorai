import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowLeft, Copy, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import TutorAvatar from "@/components/app/TutorAvatar";
import { supabase } from "@/integrations/supabase/client";
import { TUTOR_MODES, tutorModeLabel } from "@/features/tutor/modes";
import { conversationQueryOptions, conversationsQueryOptions } from "@/features/tutor/tutorService";

export const Route = createFileRoute("/_authenticated/app/tutor/$conversationId")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      conversationQueryOptions(params.conversationId),
    );
    if (!data.conversation) throw notFound();
  },
  notFoundComponent: () => (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-lg font-semibold text-foreground">Conversation not found</p>
      <Link to="/app/tutor" className="text-sm font-medium text-primary hover:text-primary-hover">
        Start a new conversation
      </Link>
    </div>
  ),
  component: ConversationPage,
});

function ConversationPage() {
  const { conversationId } = Route.useParams();
  const { data } = useSuspenseQuery(conversationQueryOptions(conversationId));
  // Remount per conversation so messages never bleed between threads.
  return (
    <TutorChat
      key={conversationId}
      conversationId={conversationId}
      mode={data.conversation?.mode ?? "guided"}
      title={data.conversation?.title ?? "New conversation"}
      initialMessages={data.messages}
    />
  );
}

function textOf(message: UIMessage) {
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
}

function TutorChat({
  conversationId,
  mode,
  title,
  initialMessages,
}: {
  conversationId: string;
  mode: string;
  title: string;
  initialMessages: UIMessage[];
}) {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const { data: conversations } = useQuery(conversationsQueryOptions(user.id));
  const liveTitle = conversations?.find((item) => item.id === conversationId)?.title ?? title;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/tutor",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [],
  );

  const { messages, sendMessage, status, stop, regenerate, error } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onError: (err) => {
      toast.error(readableError(err));
    },
    onFinish: ({ messages: finished }) => {
      queryClient.setQueryData(conversationQueryOptions(conversationId).queryKey, (previous) =>
        previous ? { ...previous, messages: finished } : previous,
      );
      void queryClient.invalidateQueries({ queryKey: ["tutor", "conversations", user.id] });
    },
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy]);

  function handleSubmit(message: PromptInputMessage) {
    const text = message.text.trim();
    if (!text || busy) return;
    void sendMessage({ text });
  }

  const starters = TUTOR_MODES.find((item) => item.value === mode)?.starters ?? [];
  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <Link
          to="/app/tutor"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <TutorAvatar size={32} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{liveTitle}</p>
          <p className="text-xs text-muted-foreground">{tutorModeLabel(mode)}</p>
        </div>
      </header>

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <TutorAvatar size={72} />
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                What would you like to learn?
              </h2>
              <p className="mt-1 max-w-md text-sm text-subtle-foreground">
                Ask anything, or start with one of these.
              </p>
              <div className="mt-6 flex w-full max-w-lg flex-col gap-2">
                {starters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => void sendMessage({ text: starter })}
                    disabled={busy}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-brand-border hover:bg-accent"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              {message.role === "assistant" ? (
                <div className="flex gap-3">
                  <TutorAvatar size={28} />
                  <div className="min-w-0 flex-1 space-y-2">
                    {message.parts.map((part, index) => {
                      if (part.type === "reasoning" && part.text) {
                        return (
                          <Reasoning
                            key={index}
                            isStreaming={status === "streaming" && message.id === lastAssistantId}
                            defaultOpen={false}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      }
                      if (part.type === "text") {
                        return (
                          <MessageContent key={index}>
                            <MessageResponse>{part.text}</MessageResponse>
                          </MessageContent>
                        );
                      }
                      return null;
                    })}
                    {!busy || message.id !== lastAssistantId ? (
                      <MessageActions>
                        <MessageAction
                          tooltip="Copy"
                          label="Copy answer"
                          onClick={() => {
                            void navigator.clipboard.writeText(textOf(message));
                            toast.success("Copied");
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </MessageAction>
                        {message.id === lastAssistantId ? (
                          <MessageAction
                            tooltip="Regenerate"
                            label="Regenerate answer"
                            onClick={() => void regenerate()}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </MessageAction>
                        ) : null}
                      </MessageActions>
                    ) : null}
                  </div>
                </div>
              ) : (
                <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <p key={index} className="whitespace-pre-wrap">
                        {part.text}
                      </p>
                    ) : null,
                  )}
                </MessageContent>
              )}
            </Message>
          ))}

          {status === "submitted" ? (
            <div className="flex items-center gap-3">
              <TutorAvatar size={28} />
              <Shimmer>Thinking…</Shimmer>
            </div>
          ) : null}

          {error && !busy ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive-border bg-destructive-soft px-4 py-3 text-sm text-destructive">
              <span>{readableError(error)}</span>
              <button
                type="button"
                onClick={() => void regenerate()}
                className="font-medium underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-card px-4 py-3 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              ref={textareaRef}
              autoFocus
              placeholder="Ask your tutor anything…"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI-powered answers can be wrong. Check important facts.
          </p>
        </div>
      </div>
    </div>
  );
}

function readableError(error: Error): string {
  const raw = error.message ?? "";
  try {
    const parsed = JSON.parse(raw) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    // not JSON
  }
  return raw && raw.length < 200 ? raw : "The tutor couldn't answer just now. Please try again.";
}
