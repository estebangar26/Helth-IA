/** BACKEND · Resolución del espacio autorizado para la sesión actual. */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type RolAplicacion = "paciente" | "medico" | "admin";

/**
 * Activa una invitación médica pendiente antes de resolver el rol. Esto permite
 * que una profesional invitada entre por primera vez directamente a /medico.
 */
export const obtenerMiRol = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RolAplicacion> => {
    const correo = String(context.claims.email ?? "").trim().toLowerCase();

    if (correo) {
      const { error: errorActivacion } = await context.supabase
        .from("accesos_medicos")
        .update({
          doctor_id: context.userId,
          estado: "activo",
          aceptado_en: new Date().toISOString(),
        })
        .eq("doctor_email", correo)
        .eq("estado", "pendiente")
        .is("doctor_id", null);
      if (errorActivacion) throw new Error("No se pudo validar el espacio médico.");
    }

    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error("No se pudo identificar el espacio de la cuenta.");
    return data?.role === "medico" || data?.role === "admin" ? data.role : "paciente";
  });
