CREATE TYPE public.app_role AS ENUM ('paciente', 'medico');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usuarios_ven_su_rol"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

INSERT INTO public.user_roles (user_id, role)
SELECT p.id,
  CASE WHEN EXISTS (
    SELECT 1 FROM public.accesos_medicos a
    WHERE a.doctor_id = p.id AND a.estado = 'activo'
  ) THEN 'medico'::public.app_role ELSE 'paciente'::public.app_role END
FROM public.perfiles p
ON CONFLICT (user_id, role) DO NOTHING;

ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS tipo_atencion text NOT NULL DEFAULT 'privado',
  ADD COLUMN IF NOT EXISTS eps_nombre text,
  ADD COLUMN IF NOT EXISTS medico_familia text,
  ADD COLUMN IF NOT EXISTS medico_tratante text;

ALTER TABLE public.perfiles
  ADD CONSTRAINT perfiles_tipo_atencion_valido
  CHECK (tipo_atencion IN ('eps', 'privado')) NOT VALID;
ALTER TABLE public.perfiles VALIDATE CONSTRAINT perfiles_tipo_atencion_valido;

CREATE TABLE public.especialistas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  especialidad text NOT NULL,
  enfermedad_que_atiende text NOT NULL,
  ciudad text NOT NULL,
  contacto text NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.especialistas TO authenticated;
GRANT ALL ON public.especialistas TO service_role;
ALTER TABLE public.especialistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pacientes_consultan_especialistas"
ON public.especialistas FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'paciente'));
CREATE INDEX especialistas_filtros_idx
ON public.especialistas (enfermedad_que_atiende, especialidad);

CREATE OR REPLACE FUNCTION public.crear_perfil_nuevo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'nombre', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'paciente')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.asignar_rol_medico_al_aceptar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.estado = 'activo' AND NEW.doctor_id IS NOT NULL
     AND (OLD.estado IS DISTINCT FROM NEW.estado OR OLD.doctor_id IS DISTINCT FROM NEW.doctor_id) THEN
    DELETE FROM public.user_roles WHERE user_id = NEW.doctor_id AND role = 'paciente';
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.doctor_id, 'medico')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER asignar_rol_medico_al_aceptar
AFTER UPDATE ON public.accesos_medicos
FOR EACH ROW EXECUTE FUNCTION public.asignar_rol_medico_al_aceptar();