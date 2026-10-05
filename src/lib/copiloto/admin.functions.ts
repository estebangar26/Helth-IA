/** BACKEND · Panel administrativo. Cada función verifica el rol en el servidor. */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any };
async function exigirAdmin({ supabase }: Ctx) {
  const { data } = await supabase.rpc("es_admin");
  if (!data) throw new Error("Acceso solo para administradores.");
}

export const obtenerResumenAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirAdmin(context);
    const sb = context.supabase;
    const [perfiles, roles, alertas, especialistas] = await Promise.all([
      sb.from("perfiles").select("id, nombre, tipo_atencion, created_at").order("created_at", { ascending: false }).limit(50),
      sb.from("user_roles").select("user_id, role"),
      sb.from("alertas_medicas").select("id, titular, nivel, estado_envio, creado_en").order("creado_en", { ascending: false }).limit(20),
      sb.from("especialistas").select("id, nombre, especialidad, enfermedad_que_atiende, ciudad, contacto").order("nombre"),
    ]);
    const rolDe = new Map((roles.data ?? []).map((r) => [r.user_id, r.role as string]));
    return {
      usuarios: (perfiles.data ?? []).map((p) => ({ id: p.id, nombre: p.nombre, tipo: p.tipo_atencion, rol: rolDe.get(p.id) ?? "paciente" })),
      alertas: alertas.data ?? [],
      especialistas: especialistas.data ?? [],
    };
  });

const esquemaEspecialista = z.object({
  nombre: z.string().trim().min(3).max(120),
  especialidad: z.string().trim().min(3).max(120),
  enfermedad_que_atiende: z.string().trim().min(3).max(120),
  ciudad: z.string().trim().min(2).max(80),
  contacto: z.string().trim().min(5).max(120),
});

export const crearEspecialista = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((e: unknown) => esquemaEspecialista.parse(e))
  .handler(async ({ data, context }) => {
    await exigirAdmin(context);
    const { error } = await context.supabase.from("especialistas").insert(data);
    if (error) throw new Error("No se pudo crear el especialista.");
    return { ok: true };
  });

export const borrarEspecialista = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((e: unknown) => z.object({ id: z.string().uuid() }).parse(e))
  .handler(async ({ data, context }) => {
    await exigirAdmin(context);
    const { error } = await context.supabase.from("especialistas").delete().eq("id", data.id);
    if (error) throw new Error("No se pudo eliminar.");
    return { ok: true };
  });
