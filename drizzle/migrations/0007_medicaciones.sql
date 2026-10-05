CREATE TABLE public.medicaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  dosis text,
  frecuencia text,
  notas text,
  creado_en timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicaciones TO authenticated;
GRANT ALL ON public.medicaciones TO service_role;
ALTER TABLE public.medicaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY medicaciones_propias ON public.medicaciones FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY doctora_ve_medicaciones ON public.medicaciones FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.accesos_medicos a WHERE a.paciente_id = medicaciones.user_id AND a.doctor_id = auth.uid() AND a.estado = 'activo'));