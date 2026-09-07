CREATE TABLE public.perfiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT 'Paciente',
  edad INTEGER,
  documento TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfiles TO authenticated;
GRANT ALL ON public.perfiles TO service_role;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perfiles_propios" ON public.perfiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.examenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  laboratorio TEXT,
  fecha DATE NOT NULL,
  glucemia_ayunas NUMERIC,
  hba1c NUMERIC,
  presion_sistolica INTEGER,
  presion_diastolica INTEGER,
  creatinina NUMERIC,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.examenes TO authenticated;
GRANT ALL ON public.examenes TO service_role;
ALTER TABLE public.examenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "examenes_propios" ON public.examenes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX examenes_user_fecha_idx ON public.examenes (user_id, fecha DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER perfiles_updated_at BEFORE UPDATE ON public.perfiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER examenes_updated_at BEFORE UPDATE ON public.examenes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.crear_perfil_nuevo_usuario()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'nombre', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.crear_perfil_nuevo_usuario();