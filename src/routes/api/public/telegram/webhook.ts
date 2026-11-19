/** Webhook del bot: vincula el chat cuando el paciente envía /start <código>. */
import { createFileRoute } from '@tanstack/react-router';
import { derivarSecreto, igual, enviarTelegram } from '@/lib/telegram/telegram.server';

export const Route = createFileRoute('/api/public/telegram/webhook')({
  server: { handlers: { POST: async ({ request }) => {
    const esperado = await derivarSecreto('telegram-webhook');
    if (!igual(request.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? '', esperado)) return new Response('Unauthorized', { status: 401 });
    const u = await request.json();
    const chatId: number | undefined = u?.message?.chat?.id;
    const text: string = u?.message?.text ?? '';
    if (!chatId) return Response.json({ ok: true });
    const code = text.match(/^\/start\s+([a-f0-9]{32})$/)?.[1];
    if (!code) { await enviarTelegram(chatId, 'Hola. Para recibir recordatorios, abre el enlace desde «Mis medicaciones» en HelthIA.'); return Response.json({ ok: true }); }
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data } = await supabaseAdmin.from('telegram_links').select('user_id,code_expires_at').eq('link_code', code).maybeSingle();
    if (!data || !data.code_expires_at || new Date(data.code_expires_at) < new Date()) { await enviarTelegram(chatId, 'El enlace venció. Genera uno nuevo en HelthIA.'); return Response.json({ ok: true }); }
    await supabaseAdmin.from('telegram_links').update({ chat_id: chatId, linked_at: new Date().toISOString(), link_code: null, code_expires_at: null }).eq('user_id', data.user_id);
    await enviarTelegram(chatId, '✅ Listo. Recibirás aquí los recordatorios de tus medicamentos activos.');
    return Response.json({ ok: true });
  } } },
});
