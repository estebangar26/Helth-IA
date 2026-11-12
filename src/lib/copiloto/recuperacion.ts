import { createClient } from '@supabase/supabase-js';
import { brokeredPreviewStorage } from '@/integrations/supabase/previewAuthStorage';

let cliente: ReturnType<typeof createClient> | undefined;

/** Cliente aislado: esta pantalla procesa el token explícitamente y solo una vez. */
export function obtenerClienteRecuperacion() {
  if (!cliente) {
    cliente = createClient(
      import.meta.env['VITE_SUPABASE_URL'],
      import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'],
      {
        auth: {
          storage: brokeredPreviewStorage(),
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storageKey: `sb-${import.meta.env['VITE_SUPABASE_PROJECT_ID']}-auth-token`,
        },
      },
    );
  }
  return cliente;
}

/** Interpreta únicamente los parámetros admitidos para recuperar una contraseña. */
export type EnlaceRecuperacion =
  | { tipo: 'implicito'; accessToken: string; refreshToken: string }
  | { tipo: 'codigo'; codigo: string }
  | { tipo: 'token'; tokenHash: string }
  | { tipo: 'error' }
  | { tipo: 'ausente' };

export function leerEnlaceRecuperacion(href: string): EnlaceRecuperacion {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const query = url.searchParams;
  if (hash.get('error') || hash.get('error_code') || query.get('error') || query.get('error_code')) {
    return { tipo: 'error' };
  }

  const tipo = hash.get('type') ?? query.get('type');
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  if (tipo === 'recovery' && accessToken && refreshToken) {
    return { tipo: 'implicito', accessToken, refreshToken };
  }

  const tokenHash = query.get('token_hash');
  if (tipo === 'recovery' && tokenHash) return { tipo: 'token', tokenHash };

  const codigo = query.get('code');
  if (codigo && (!tipo || tipo === 'recovery')) return { tipo: 'codigo', codigo };
  return { tipo: 'ausente' };
}

/** Quita credenciales de la URL antes de inicializar el cliente de autenticación. */
export function limpiarEnlaceRecuperacion(href: string): string {
  const url = new URL(href);
  url.hash = '';
  for (const parametro of ['code', 'flow_id', 'token_hash', 'type', 'error', 'error_code', 'error_description']) {
    url.searchParams.delete(parametro);
  }
  return `${url.pathname}${url.search}`;
}
