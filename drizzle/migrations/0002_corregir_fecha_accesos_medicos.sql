CREATE OR REPLACE FUNCTION public.set_accesos_medicos_actualizado_en()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER accesos_medicos_updated_at ON public.accesos_medicos;

CREATE TRIGGER accesos_medicos_actualizado_en
BEFORE UPDATE ON public.accesos_medicos
FOR EACH ROW EXECUTE FUNCTION public.set_accesos_medicos_actualizado_en();