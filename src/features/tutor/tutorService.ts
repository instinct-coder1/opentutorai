import { queryOptions } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { supabase } from "@/integrations/supabase/client";
import type { TutorMode } from "@/features/tutor/modes";

export interface TutorConversation {
  id: string;
  title: string;
  mode: string;
  updated_at: string;
}

export const conversationsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["tutor", "conversations", userId],
    queryFn: async (): Promise<TutorConversation[]> => {
      const { data, error } = await supabase
        .from("tutor_conversations")
        .select("id, title, mode, updated_at")
        .order("updated_at", { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const conversationQueryOptions = (conversationId: string) =>
  queryOptions({
    queryKey: ["tutor", "conversation", conversationId],
    queryFn: async (): Promise<{ conversation: TutorConversation | null; messages: UIMessage[] }> => {
      const { data: conversation, error } = await supabase
        .from("tutor_conversations")
        .select("id, title, mode, updated_at")
        .eq("id", conversationId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!conversation) return { conversation: null, messages: [] };
      const { data: rows, error: messagesError } = await supabase
        .from("tutor_messages")
        .select("message")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (messagesError) throw new Error(messagesError.message);
      return {
        conversation,
        messages: (rows ?? []).map((row) => row.message as unknown as UIMessage),
      };
    },
    staleTime: Infinity,
  });

export async function createConversation(mode: TutorMode): Promise<string> {
  const { data, error } = await supabase
    .from("tutor_conversations")
    .insert({ mode })
    .select("id")
    .single();
  if (error) throw new Error("Could not start a new conversation. Please try again.");
  return data.id;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase.from("tutor_conversations").delete().eq("id", conversationId);
  if (error) throw new Error("Could not delete this conversation. Please try again.");
}
