/** Avisos dentro de la plataforma. El médico solo puede insertar, nunca editar exámenes. */
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { esquemaObservacion, puedeAnotar } from './observaciones-validacion';

export interface ObservacionMedica {
  id: string; examen_id: string; medico_nombre: string; mensaje: string; creado_en: string;
}

export const listarObservaciones = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .inputValidator((entrada: unknown) => z.object({ pacienteId: z.string().uuid().optional() }).parse(entrada))
  .handler(async ({ context, data }): Promise<ObservacionMedica[]> => {
    const pacienteId = data.pacienteId ?? context.userId;
    // RLS limita las lecturas al paciente o al médico con acceso activo.
    const { data: filas, error } = await context.supabase.from('observaciones_medicas')
      .select('id,examen_id,medico_nombre,mensaje,creado_en').eq('paciente_id', pacienteId).order('creado_en', { ascending: false });
    if (error) throw new Error('No se pudieron leer las observaciones médicas.');
    return filas ?? [];
  });

export const crearObservacion = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((entrada: unknown) => esquemaObservacion.parse(entrada))
  .handler(async ({ context, data }) => {
    const [{ data: rol }, { data: acceso }, { data: examen }] = await Promise.all([
      context.supabase.from('user_roles').select('role').eq('user_id', context.userId).eq('role', 'medico').maybeSingle(),
      context.supabase.from('accesos_medicos').select('id').eq('paciente_id', data.pacienteId).eq('doctor_id', context.userId).eq('estado', 'activo').maybeSingle(),
      context.supabase.from('examenes').select('id').eq('id', data.examenId).eq('user_id', data.pacienteId).maybeSingle(),
    ]);
    if (!puedeAnotar(Boolean(rol), Boolean(acceso), Boolean(examen))) throw new Error('No tiene permiso para dejar observaciones sobre este examen.');
    const { data: observacion, error } = await context.supabase.from('observaciones_medicas')
      .insert({ paciente_id: data.pacienteId, medico_id: context.userId, examen_id: data.examenId, mensaje: data.mensaje })
      .select('id').single();
    if (error || !observacion) throw new Error('No se pudo enviar la observación. Compruebe que el acceso siga activo.');

    // El correo se obtiene solo en el servidor después de validar rol, acceso y examen.
    // Nunca se devuelve al médico ni se incluye contenido clínico en la notificación.
    let correoEnviado = false;
    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const { data: usuario, error: errorUsuario } = await supabaseAdmin.auth.admin.getUserById(data.pacienteId);
      if (errorUsuario || !usuario.user.email) throw new Error('Correo del paciente no disponible.');
      const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
      const resultado = await sendTemplateEmail('mensaje-medico', usuario.user.email, {
        templateData: { enlace: 'https://helthicorp.tech/paciente/resultados' },
        idempotencyKey: `mensaje-medico-${observacion.id}`,
      });
      correoEnviado = resultado.sent;
    } catch (e) {
      // La observación ya quedó guardada; el médico verá que el aviso no se envió.
      console.error('No se pudo enviar el aviso de observación médica', e);
    }
    return { ok: true, correoEnviado };
  });