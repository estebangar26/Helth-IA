CREATE TABLE public.accesos_medicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  doctor_email TEXT NOT NULL,
  doctor_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'activo', 'revocado')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  aceptado_en TIMESTAMPTZ,
  revocado_en TIMESTAMPTZ,
  CONSTRAINT accesos_medicos_email_normalizado CHECK (doctor_email = lower(trim(doctor_email)))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.accesos_medicos TO authenticated;
GRANT ALL ON public.accesos_medicos TO service_role;

ALTER TABLE public.accesos_medicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paciente_gestiona_accesos_medicos"
ON public.accesos_medicos
FOR ALL
TO authenticated
USING (auth.uid() = paciente_id)
WITH CHECK (auth.uid() = paciente_id);

CREATE POLICY "doctora_ve_sus_accesos_activos"
ON public.accesos_medicos
FOR SELECT
TO authenticated
USING (auth.uid() = doctor_id AND estado = 'activo');

CREATE POLICY "doctora_acepta_invitacion_por_correo"
ON public.accesos_medicos
FOR UPDATE
TO authenticated
USING (
  estado = 'pendiente'
  AND doctor_id IS NULL
  AND lower(coalesce(auth.jwt() ->> 'email', '')) = doctor_email
)
WITH CHECK (
  auth.uid() = doctor_id
  AND estado = 'activo'
  AND lower(coalesce(auth.jwt() ->> 'email', '')) = doctor_email
);

CREATE UNIQUE INDEX accesos_medicos_abiertos_idx
ON public.accesos_medicos (paciente_id, doctor_email)
WHERE estado IN ('pendiente', 'activo');

CREATE INDEX accesos_medicos_doctor_activo_idx
ON public.accesos_medicos (doctor_id, estado)
WHERE estado = 'activo';

CREATE TRIGGER accesos_medicos_updated_at
BEFORE UPDATE ON public.accesos_medicos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "doctora_ve_perfil_compartido"
ON public.perfiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.accesos_medicos acceso
    WHERE acceso.paciente_id = perfiles.id
      AND acceso.doctor_id = auth.uid()
      AND acceso.estado = 'activo'
  )
);

CREATE POLICY "doctora_ve_examenes_compartidos"
ON public.examenes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.accesos_medicos acceso
    WHERE acceso.paciente_id = examenes.user_id
      AND acceso.doctor_id = auth.uid()
      AND acceso.estado = 'activo'
  )
);