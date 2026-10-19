CREATE TABLE public.resultados_biomarcador (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  examen_id uuid NOT NULL REFERENCES public.examenes(id) ON DELETE CASCADE,
  codigo text NOT NULL,
  nombre text NOT NULL,
  categoria text NOT NULL,
  valor numeric NOT NULL,
  unidad text,
  referencia_texto text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX resultados_biomarcador_examen_idx ON public.resultados_biomarcador (examen_id, codigo);
GRANT SELECT, INSERT, DELETE ON public.resultados_biomarcador TO authenticated;
GRANT ALL ON public.resultados_biomarcador TO service_role;
ALTER TABLE public.resultados_biomarcador ENABLE ROW LEVEL SECURITY;
CREATE POLICY paciente_gestiona_resultados ON public.resultados_biomarcador FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.examenes e WHERE e.id = examen_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.examenes e WHERE e.id = examen_id AND e.user_id = auth.uid()));
CREATE POLICY doctora_ve_resultados_compartidos ON public.resultados_biomarcador FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.examenes e
    JOIN public.accesos_medicos a ON a.paciente_id = e.user_id
    WHERE e.id = examen_id AND a.doctor_id = auth.uid() AND a.estado = 'activo'
  ));