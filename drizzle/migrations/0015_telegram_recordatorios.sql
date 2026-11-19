CREATE TABLE public.telegram_links (user_id uuid PRIMARY KEY, chat_id bigint, link_code text UNIQUE, code_expires_at timestamptz, linked_at timestamptz);
GRANT SELECT ON public.telegram_links TO authenticated;
GRANT ALL ON public.telegram_links TO service_role;
ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Paciente ve su vinculo" ON public.telegram_links FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TABLE public.medication_reminders_sent (medication_id uuid NOT NULL, scheduled_at timestamptz NOT NULL, sent_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (medication_id, scheduled_at));
GRANT ALL ON public.medication_reminders_sent TO service_role;
ALTER TABLE public.medication_reminders_sent ENABLE ROW LEVEL SECURITY;