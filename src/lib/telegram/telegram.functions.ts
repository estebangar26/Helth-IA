/** Vinculación del paciente con el bot de Telegram para recordatorios. */
import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const BOT = 'helthIA_bot';

export const estadoTelegram = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data } = await context.supabase.from('telegram_links').select('linked_at').eq('user_id', context.userId).maybeSingle();
  return { vinculado: Boolean(data?.linked_at) };
});

/** Genera un código de un solo uso (30 min) y devuelve el enlace al bot. */
export const enlaceTelegram = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const code = crypto.randomUUID().replace(/-/g, '');
  const { error } = await supabaseAdmin.from('telegram_links').upsert({ user_id: context.userId, link_code: code, code_expires_at: new Date(Date.now() + 30 * 60000).toISOString() });
  if (error) throw new Error('No se pudo generar el enlace de Telegram.');
  return { url: `https://t.me/${BOT}?start=${code}` };
});

export const desvincularTelegram = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  await supabaseAdmin.from('telegram_links').delete().eq('user_id', context.userId);
  return { ok: true };
});
