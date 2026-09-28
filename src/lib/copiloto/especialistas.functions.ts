/** BACKEND · Directorio de especialistas visible solo para pacientes. */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface Especialista {
  id: string;
  nombre: string;
  especialidad: string;
  enfermedad: string;
  ciudad: string;
  contacto: string;
}

export const listarEspecialistas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Especialista[]> => {
    const { data: rol } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "paciente")
      .maybeSingle();
    if (!rol) throw new Error("Este directorio está disponible para pacientes.");

    const { data, error } = await context.supabase
      .from("especialistas")
      .select("id, nombre, especialidad, enfermedad_que_atiende, ciudad, contacto")
      .order("nombre");
    if (error) throw new Error("No se pudo cargar el directorio de especialistas.");

    return (data ?? []).map((fila) => ({
      id: fila.id,
      nombre: fila.nombre,
      especialidad: fila.especialidad,
      enfermedad: fila.enfermedad_que_atiende,
      ciudad: fila.ciudad,
      contacto: fila.contacto,
    }));
  });
