CREATE POLICY "doctora_ve_invitacion_pendiente_por_correo"
ON public.accesos_medicos
FOR SELECT
TO authenticated
USING (
  estado = 'pendiente'
  AND doctor_id IS NULL
  AND lower(coalesce(auth.jwt() ->> 'email', '')) = doctor_email
);