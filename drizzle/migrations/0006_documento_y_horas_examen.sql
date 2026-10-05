ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS documento_validado_en timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS perfiles_documento_unico ON public.perfiles (upper(documento)) WHERE documento IS NOT NULL;
ALTER TABLE public.examenes ADD COLUMN IF NOT EXISTS validado_en timestamptz;
COMMENT ON COLUMN public.examenes.validado_en IS 'Fecha y hora de validación de resultados indicada por el laboratorio';
COMMENT ON COLUMN public.examenes.created_at IS 'Fecha y hora de carga a la plataforma';