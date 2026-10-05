ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TABLE public.examenes ADD COLUMN IF NOT EXISTS recomendaciones text[];
CREATE OR REPLACE FUNCTION public.es_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin')
$$;
GRANT EXECUTE ON FUNCTION public.es_admin() TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.especialistas TO authenticated;
CREATE POLICY "Admin lee perfiles" ON public.perfiles FOR SELECT TO authenticated USING (public.es_admin());
CREATE POLICY "Admin lee roles" ON public.user_roles FOR SELECT TO authenticated USING (public.es_admin());
CREATE POLICY "Admin lee alertas" ON public.alertas_medicas FOR SELECT TO authenticated USING (public.es_admin());
CREATE POLICY "Admin lee especialistas" ON public.especialistas FOR SELECT TO authenticated USING (public.es_admin());
CREATE POLICY "Admin crea especialistas" ON public.especialistas FOR INSERT TO authenticated WITH CHECK (public.es_admin());
CREATE POLICY "Admin borra especialistas" ON public.especialistas FOR DELETE TO authenticated USING (public.es_admin());