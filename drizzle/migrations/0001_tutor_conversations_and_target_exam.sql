ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_exam text CHECK (target_exam IS NULL OR char_length(target_exam) <= 120);

CREATE TABLE public.tutor_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation' CHECK (char_length(title) <= 120),
  mode text NOT NULL DEFAULT 'guided' CHECK (mode IN ('guided', 'explain', 'hint', 'practice', 'exam', 'coding')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutor_conversations TO authenticated;
GRANT ALL ON public.tutor_conversations TO service_role;

ALTER TABLE public.tutor_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_conversations_select" ON public.tutor_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_conversations_insert" ON public.tutor_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_conversations_update" ON public.tutor_conversations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_conversations_delete" ON public.tutor_conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX tutor_conversations_user_updated_idx ON public.tutor_conversations (user_id, updated_at DESC);

CREATE TRIGGER tutor_conversations_set_updated_at
BEFORE UPDATE ON public.tutor_conversations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.tutor_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.tutor_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  ui_message_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  message jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, ui_message_id)
);

GRANT SELECT, INSERT, DELETE ON public.tutor_messages TO authenticated;
GRANT ALL ON public.tutor_messages TO service_role;

ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_messages_select" ON public.tutor_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_messages_insert" ON public.tutor_messages FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.tutor_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );
CREATE POLICY "own_messages_delete" ON public.tutor_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX tutor_messages_conversation_created_idx ON public.tutor_messages (conversation_id, created_at);