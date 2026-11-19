CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  nombre text NOT NULL,
  email text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('contacto', 'opinion', 'peticion', 'queja', 'reclamo', 'sugerencia')),
  mensaje text NOT NULL,
  owner_notified_at timestamptz
);
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;