// Cliente de base de datos para las herramientas MCP: reenvía el token del usuario para que RLS aplique.
import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

function env(nombres: string[]): string | undefined {
  const p = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  for (const n of nombres) {
    const v = p?.env?.[n]?.trim();
    if (v) return v;
  }
  return undefined;
}

export function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!token) throw new Error("Se requiere un usuario autenticado");
  const url = env(["SUPABASE_URL", "VITE_SUPABASE_URL"]);
  const key = env(["SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY"]);
  if (!url || !key) throw new Error("Configuración del servidor incompleta");
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
