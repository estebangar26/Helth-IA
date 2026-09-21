-- Nuevos biomarcadores por tipo de examen
ALTER TABLE public.examenes
  ADD COLUMN IF NOT EXISTS tipo_examen text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS glucemia_posprandial numeric,
  ADD COLUMN IF NOT EXISTS insulina numeric,
  ADD COLUMN IF NOT EXISTS peptido_c numeric,
  ADD COLUMN IF NOT EXISTS anticuerpos_gad numeric,
  ADD COLUMN IF NOT EXISTS sodio numeric,
  ADD COLUMN IF NOT EXISTS osmolaridad_plasmatica numeric,
  ADD COLUMN IF NOT EXISTS osmolaridad_urinaria numeric,
  ADD COLUMN IF NOT EXISTS densidad_urinaria numeric,
  ADD COLUMN IF NOT EXISTS psa numeric,
  ADD COLUMN IF NOT EXISTS ca125 numeric,
  ADD COLUMN IF NOT EXISTS ca19_9 numeric,
  ADD COLUMN IF NOT EXISTS cea numeric,
  ADD COLUMN IF NOT EXISTS afp numeric,
  ADD COLUMN IF NOT EXISTS testosterona_total numeric,
  ADD COLUMN IF NOT EXISTS testosterona_libre numeric;

-- Registro de alertas enviadas al médico tratante
CREATE TABLE IF NOT EXISTS public.alertas_medicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  examen_id uuid REFERENCES public.examenes(id) ON DELETE SET NULL,
  doctor_email text NOT NULL,
  nivel text NOT NULL DEFAULT 'alert',
  titular text NOT NULL,
  detalle text NOT NULL,
  estado_envio text NOT NULL DEFAULT 'pendiente',
  motivo_envio text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.alertas_medicas TO authenticated;
GRANT ALL ON public.alertas_medicas TO service_role;

ALTER TABLE public.alertas_medicas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS paciente_ve_sus_alertas ON public.alertas_medicas;
CREATE POLICY paciente_ve_sus_alertas ON public.alertas_medicas
  FOR SELECT TO authenticated
  USING (auth.uid() = paciente_id);

DROP POLICY IF EXISTS paciente_crea_sus_alertas ON public.alertas_medicas;
CREATE POLICY paciente_crea_sus_alertas ON public.alertas_medicas
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = paciente_id);

DROP POLICY IF EXISTS doctora_ve_alertas_compartidas ON public.alertas_medicas;
CREATE POLICY doctora_ve_alertas_compartidas ON public.alertas_medicas
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.accesos_medicos acceso
    WHERE acceso.paciente_id = alertas_medicas.paciente_id
      AND acceso.doctor_id = auth.uid()
      AND acceso.estado = 'activo'
  ));

CREATE INDEX IF NOT EXISTS alertas_medicas_paciente_idx ON public.alertas_medicas (paciente_id, creado_en DESC);