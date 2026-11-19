/** Revisión periódica (cada 15 min): envía recordatorios de tomas por Telegram. */
import { createFileRoute } from '@tanstack/react-router';
import { derivarSecreto, igual, enviarTelegram } from '@/lib/telegram/telegram.server';
import { enviarRecordatorio, type PuertoRecordatorios } from '@/lib/telegram/recordatorios.server';
import { configuracion, horariosEntre, estadoTratamiento } from '@/lib/medicaciones/modelo';

export const Route = createFileRoute('/api/public/telegram/recordatorios')({
  server: { handlers: { POST: async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    if (!igual(String(body?.secret ?? ''), await derivarSecreto('telegram-cron'))) return new Response('Unauthorized', { status: 401 });
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server');
    const { data: links } = await db.from('telegram_links').select('user_id,chat_id').not('chat_id', 'is', null);
    if (!links?.length) return Response.json({ enviados: 0 });
    const ids = links.map(l => l.user_id);
    const { data: prefs } = await db.from('notification_prefs').select('user_id,health_consent').in('user_id', ids);
    const ok = new Set((prefs ?? []).filter(p => p.health_consent).map(p => p.user_id));
    const { data: meds } = await db.from('medicaciones').select('id,user_id,nombre,detalle').in('user_id', [...ok]);
    const ahora = Date.now(); let enviados = 0;
    const puerto: PuertoRecordatorios = {
      marcarEnviada: async (marca) => (await db.from('medication_reminders_sent').insert(marca)).error,
      quitarMarca: async (marca) => await db.from('medication_reminders_sent').delete().eq('medication_id', marca.medication_id).eq('scheduled_at', marca.scheduled_at),
    };
    for (const m of meds ?? []) {
      const c = configuracion.safeParse(m.detalle); if (!c.success || estadoTratamiento(c.data) !== 'activo') continue;
      const ant = c.data.anticipacion * 60000;
      const tomas = horariosEntre(c.data, new Date(ahora + ant), new Date(ahora + ant + 15 * 60000 - 1));
      const chat = links.find(l => l.user_id === m.user_id)?.chat_id; if (!chat) continue;
      for (const t of tomas) {
        const ok = await enviarRecordatorio({ puerto, chatId: Number(chat), medicationId: m.id, nombre: m.nombre, config: c.data, scheduledAt: t, enviar: enviarTelegram });
        if (ok) enviados++;
      }
    }
    return Response.json({ enviados });
  } } },
});
