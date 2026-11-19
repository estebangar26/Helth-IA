/** Utilidades de servidor para el bot de Telegram (vía gateway de conectores). */
const GATEWAY = 'https://connector-gateway.lovable.dev/telegram';

/** Deriva un secreto estable a partir de la clave de conexión (no se guarda en ningún lado). */
export async function derivarSecreto(prefijo: string): Promise<string> {
  const key = process.env['TELEGRAM_API_KEY'];
  if (!key) throw new Error('TELEGRAM_API_KEY no configurada');
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${prefijo}:${key}`));
  return btoa(String.fromCharCode(...new Uint8Array(h))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function igual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Envía un mensaje de texto a un chat. */
export async function enviarTelegram(chatId: number, text: string) {
  const lk = process.env['LOVABLE_API_KEY'], tk = process.env['TELEGRAM_API_KEY'];
  if (!lk || !tk) throw new Error('Credenciales de Telegram no configuradas');
  const r = await fetch(`${GATEWAY}/sendMessage`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${lk}`, 'X-Connection-Api-Key': tk, 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!r.ok) throw new Error(`Telegram [${r.status}]: ${await r.text()}`);
}
