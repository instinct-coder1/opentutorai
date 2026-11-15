import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, createIdGenerator, streamText, type UIMessage } from "ai";
import type { Database } from "@/integrations/supabase/types";
import { isTutorMode, titleFromText, type TutorMode } from "@/features/tutor/modes";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const TUTOR_MODEL = "openai/gpt-6-astra";
const MAX_HISTORY_MESSAGES = 40;
const generateMessageId = createIdGenerator({ prefix: "msg", size: 16 });

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function json(status: number, error: string) {
  return Response.json({ error }, { status });
}

function userSupabase(token: string) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend is not configured.");
  return createClient<Database>(url, key, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

const MODE_INSTRUCTIONS: Record<TutorMode, string> = {
  guided:
    "Guided learning mode: teach step by step. Check what the learner already knows, explain one idea at a time, and end most turns with a short question that makes them think or apply the idea.",
  explain:
    "Explain mode: give a clear, well-structured explanation at the learner's level, with a concrete example and a one-line summary. Offer to go deeper.",
  hint:
    "Hint mode: never give the final answer or full solution. Give the smallest useful hint, ask what they tried, and escalate hints gradually only if they stay stuck.",
  practice:
    "Practice mode: give one question at a time at a suitable difficulty. Wait for the learner's answer, then give feedback: say what was right, name any misconception, and adjust the next question's difficulty.",
  exam:
    "Exam preparation mode: help plan revision, explain how marks are usually earned, and set exam-style questions. Mark answers honestly and explain how to improve. Do not invent official syllabus details; say when something should be checked against the official specification.",
  coding:
    "Coding mentor mode: help the learner understand and debug code. Explain what code does and why bugs happen, suggest how to find the fix, and only show full solutions when they ask after trying. Use fenced code blocks with a language tag.",
};

function describeProfile(profile: ProfileRow | null): string {
  if (!profile) return "The learner has not completed their profile yet.";
  const lines = [
    profile.display_name && `Name: ${profile.display_name}`,
    profile.learner_type && `Learner type: ${profile.learner_type}`,
    profile.age_range && `Age range: ${profile.age_range}`,
    profile.country && `Country: ${profile.country}`,
    profile.preferred_language && `Preferred language: ${profile.preferred_language}`,
    profile.education_level && `Education level: ${profile.education_level}`,
    profile.curriculum && `Curriculum: ${profile.curriculum}`,
    profile.subjects?.length ? `Subjects of interest: ${profile.subjects.join(", ")}` : null,
    profile.self_assessed_level && `Self-assessed level: ${profile.self_assessed_level}`,
    profile.learning_goal && `Goal: ${profile.learning_goal}`,
    profile.target_exam && `Target exam: ${profile.target_exam}`,
    profile.target_date && `Target date: ${profile.target_date}`,
    profile.learning_style && `Preferred learning style: ${profile.learning_style}`,
    profile.weekly_study_minutes && `Weekly study time: ${profile.weekly_study_minutes} minutes`,
    profile.previous_experience && `Previous experience: ${profile.previous_experience}`,
  ].filter(Boolean);
  return lines.join("\n");
}

function buildInstructions(mode: TutorMode, profile: ProfileRow | null) {
  const young = profile?.age_range === "under_13" || profile?.age_range === "13_17";
  return [
    "You are the OpenTutor AI tutor: a patient, encouraging personal learning mentor.",
    "Teach understanding, not just answers. Match vocabulary and depth to the learner's level. Use Socratic questions when helpful.",
    "Be honest about uncertainty. Never present guesses as facts, and never invent sources, statistics or curriculum details.",
    "Format with short paragraphs and Markdown. Use LaTeX ($...$ or $$...$$) for maths and fenced code blocks for code.",
    "Reply in the learner's preferred language unless they write in another language.",
    young
      ? "The learner is under 18: keep content age-appropriate, never ask for personal details, and encourage involving a parent or teacher for anything sensitive."
      : "",
    MODE_INSTRUCTIONS[mode],
    "Learner profile (self-reported during onboarding, treat as context, not as verified ability):",
    describeProfile(profile),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Keep only text parts for the model; prior reasoning is not replayed. */
function historyForModel(messages: UIMessage[]): UIMessage[] {
  return messages.slice(-MAX_HISTORY_MESSAGES).map((message) => ({
    ...message,
    parts: message.parts.filter((part) => part.type === "text"),
  }));
}

function textOf(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join(" ")
    .trim();
}

function safeErrorMessage(error: unknown): string {
  const status =
    typeof error === "object" && error !== null && "statusCode" in error
      ? Number((error as { statusCode?: number }).statusCode)
      : undefined;
  if (status === 429) return "The tutor is busy right now. Please wait a moment and try again.";
  if (status === 402)
    return "AI credits for this workspace have run out. Add credits in Lovable to keep using the tutor.";
  if (status === 403) return "The tutor isn't available for this workspace right now.";
  return "The tutor couldn't answer just now. Please try again.";
}

export async function handleTutorChat(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token || token.split(".").length !== 3) return json(401, "Please sign in again.");

  const supabase = userSupabase(token);
  const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
  const userId = claims?.claims?.sub;
  if (claimsError || !userId) return json(401, "Please sign in again.");

  let body: { id?: unknown; messages?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json(400, "Invalid request.");
  }
  const conversationId = typeof body.id === "string" ? body.id : "";
  const messages = Array.isArray(body.messages) ? (body.messages as UIMessage[]) : [];
  if (!/^[0-9a-f-]{36}$/i.test(conversationId) || messages.length === 0) {
    return json(400, "Invalid request.");
  }
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || typeof last.id !== "string") {
    return json(400, "Invalid request.");
  }

  // RLS scopes this to the signed-in learner's own conversations.
  const { data: conversation, error: conversationError } = await supabase
    .from("tutor_conversations")
    .select("id, title, mode")
    .eq("id", conversationId)
    .maybeSingle();
  if (conversationError) {
    console.error("[tutor] load conversation", conversationError.message);
    return json(500, "Could not load this conversation.");
  }
  if (!conversation) return json(404, "Conversation not found.");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  const { error: saveUserError } = await supabase.from("tutor_messages").upsert(
    {
      conversation_id: conversationId,
      user_id: userId,
      ui_message_id: last.id,
      role: "user",
      message: last as unknown as Database["public"]["Tables"]["tutor_messages"]["Insert"]["message"],
    },
    { onConflict: "conversation_id,ui_message_id", ignoreDuplicates: true },
  );
  if (saveUserError) {
    console.error("[tutor] save user message", saveUserError.message);
    return json(500, "Could not save your message. Please try again.");
  }

  const isFirstMessage = conversation.title === "New conversation";
  const { error: touchError } = await supabase
    .from("tutor_conversations")
    .update(isFirstMessage ? { title: titleFromText(textOf(last)) } : { mode: conversation.mode })
    .eq("id", conversationId);
  if (touchError) console.error("[tutor] update conversation", touchError.message);

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return json(500, "The AI tutor is not configured.");

  const mode: TutorMode = isTutorMode(conversation.mode) ? conversation.mode : "guided";
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(TUTOR_MODEL),
    instructions: buildInstructions(mode, profile),
    messages: await convertToModelMessages(historyForModel(messages)),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      // Without this the assistant message id is empty and later answers collide on save.
      generateMessageId,
      sendReasoning: true,
      onError: (error) => {
        console.error("[tutor] stream error", error);
        return safeErrorMessage(error);
      },
      onFinish: async ({ messages: finalMessages, responseMessage, isAborted }) => {
        // Drop rows the client no longer has (e.g. a regenerated answer).
        const keepIds = finalMessages.map((message) => message.id);
        const { error: pruneError } = await supabase
          .from("tutor_messages")
          .delete()
          .eq("conversation_id", conversationId)
          .not("ui_message_id", "in", `(${keepIds.map((id) => `"${id}"`).join(",")})`);
        if (pruneError) console.error("[tutor] prune messages", pruneError.message);

        if (responseMessage.parts.length === 0 && isAborted) return;
        const { error: saveError } = await supabase.from("tutor_messages").upsert(
          {
            conversation_id: conversationId,
            user_id: userId,
            ui_message_id: responseMessage.id,
            role: "assistant",
            message:
              responseMessage as unknown as Database["public"]["Tables"]["tutor_messages"]["Insert"]["message"],
          },
          { onConflict: "conversation_id,ui_message_id", ignoreDuplicates: true },
        );
        if (saveError) console.error("[tutor] save assistant message", saveError.message);
      },
    }),
    runIdFetch,
  );
}
