CREATE TABLE public.observaciones_medicas (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 paciente_id uuid NOT NULL REFERENCES public.perfiles(id),
 medico_id uuid NOT NULL REFERENCES public.perfiles(id),
 examen_id uuid NOT NULL REFERENCES public.examenes(id),
 medico_nombre text NOT NULL DEFAULT '',
 mensaje text NOT NULL CHECK (char_length(trim(mensaje)) BETWEEN 1 AND 2000),
 creado_en timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.observaciones_medicas TO authenticated;
GRANT ALL ON public.observaciones_medicas TO service_role;
ALTER TABLE public.observaciones_medicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY paciente_lee_observaciones ON public.observaciones_medicas FOR SELECT TO authenticated USING (paciente_id = auth.uid());
CREATE POLICY medico_lee_observaciones_autorizadas ON public.observaciones_medicas FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'medico') AND EXISTS (SELECT 1 FROM public.accesos_medicos a WHERE a.paciente_id = observaciones_medicas.paciente_id AND a.doctor_id = auth.uid() AND a.estado = 'activo'));
CREATE POLICY medico_crea_observacion_autorizada ON public.observaciones_medicas FOR INSERT TO authenticated WITH CHECK (medico_id = auth.uid() AND public.has_role(auth.uid(), 'medico') AND EXISTS (SELECT 1 FROM public.accesos_medicos a WHERE a.paciente_id = observaciones_medicas.paciente_id AND a.doctor_id = auth.uid() AND a.estado = 'activo') AND EXISTS (SELECT 1 FROM public.examenes e WHERE e.id = observaciones_medicas.examen_id AND e.user_id = observaciones_medicas.paciente_id));
CREATE INDEX observaciones_medicas_paciente_fecha ON public.observaciones_medicas(paciente_id, creado_en DESC);
CREATE FUNCTION public.fijar_autor_observacion() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN SELECT nombre INTO NEW.medico_nombre FROM public.perfiles WHERE id = NEW.medico_id; NEW.creado_en = now(); RETURN NEW; END; $$;
CREATE TRIGGER fijar_autor_observacion BEFORE INSERT ON public.observaciones_medicas FOR EACH ROW EXECUTE FUNCTION public.fijar_autor_observacion();