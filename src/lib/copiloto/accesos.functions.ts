/**
 * BACKEND · ACCESO MÉDICO COMPARTIDO
 * ----------------------------------
 * Estas funciones siempre validan la sesión. La base de datos aplica además
 * permisos por fila: el paciente administra invitaciones y la doctora solo
 * puede leer pacientes cuyo acceso esté activo.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PanelPaciente } from "./tipos";

export interface InvitacionMedica {
  id: string;
  correo: string;
  estado: "pendiente" | "activo" | "revocado";
  creada: string;
}

export interface PacienteCompartido {
  id: string;
  nombre: string;
  edad: number | null;
  documento: string | null;
}

const esquemaCorreo = z.object({
  correo: z.string().trim().toLowerCase().email("Escriba un correo válido").max(254),
});

/** Registra una invitación. El envío se conectará al correo administrado. */
export const invitarDoctora = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((entrada: unknown) => esquemaCorreo.parse(entrada))
  .handler(async ({ data, context }): Promise<{ ok: true; invitacion: InvitacionMedica }> => {
    const { data: rol } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "paciente").maybeSingle();
    if (!rol) throw new Error("Solo los pacientes pueden invitar profesionales.");
    const correoPropio = String(context.claims.email ?? "").toLowerCase();
    if (correoPropio === data.correo) {
      throw new Error("Use el correo de la doctora, no el de su cuenta.");
    }

    const { data: fila, error } = await context.supabase
      .from("accesos_medicos")
      .insert({ paciente_id: context.userId, doctor_email: data.correo })
      .select("id, doctor_email, estado, creado_en")
      .single();

    if (error?.code === "23505") {
      throw new Error("Ya existe una invitación pendiente o activa para este correo.");
    }
    if (error || !fila) throw new Error("No se pudo crear la invitación.");

    return {
      ok: true,
      invitacion: {
        id: fila.id,
        correo: fila.doctor_email,
        estado: fila.estado as InvitacionMedica["estado"],
        creada: fila.creado_en,
      },
    };
  });

/** Lista las invitaciones vigentes que controla el paciente. */
export const listarMisInvitaciones = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<InvitacionMedica[]> => {
    const { data: rol } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "paciente").maybeSingle();
    if (!rol) throw new Error("Solo los pacientes pueden consultar invitaciones.");
    const { data, error } = await context.supabase
      .from("accesos_medicos")
      .select("id, doctor_email, estado, creado_en")
      .eq("paciente_id", context.userId)
      .neq("estado", "revocado")
      .order("creado_en", { ascending: false });

    if (error) throw new Error("No se pudieron leer las invitaciones.");
    return (data ?? []).map((fila) => ({
      id: fila.id,
      correo: fila.doctor_email,
      estado: fila.estado as InvitacionMedica["estado"],
      creada: fila.creado_en,
    }));
  });

/** Revoca inmediatamente un acceso propio, incluso si ya fue aceptado. */
export const revocarInvitacion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((entrada: unknown) => z.object({ id: z.string().uuid() }).parse(entrada))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { data: rol } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "paciente").maybeSingle();
    if (!rol) throw new Error("Solo los pacientes pueden revocar accesos.");
    const { data: fila, error } = await context.supabase
      .from("accesos_medicos")
      .update({ estado: "revocado", revocado_en: new Date().toISOString() })
      .eq("id", data.id)
      .eq("paciente_id", context.userId)
      .select("id")
      .maybeSingle();

    if (error || !fila) throw new Error("No se pudo revocar el acceso.");
    return { ok: true };
  });

/**
 * Activa invitaciones enviadas al correo verificado de la sesión y devuelve
 * los pacientes compartidos. La actualización también está limitada por RLS.
 */
export const obtenerPacientesCompartidos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PacienteCompartido[]> => {
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
      if (errorActivacion) throw new Error("No se pudo aceptar la invitación médica.");
    }

    const { data: rol } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "medico").maybeSingle();
    if (!rol) throw new Error("Este espacio está disponible para profesionales médicos.");

    const { data: accesos, error } = await context.supabase
      .from("accesos_medicos")
      .select("paciente_id")
      .eq("doctor_id", context.userId)
      .eq("estado", "activo");
    if (error) throw new Error("No se pudieron leer los pacientes compartidos.");

    const ids = (accesos ?? []).map((acceso) => acceso.paciente_id);
    if (ids.length === 0) return [];

    const { data: perfiles, error: errorPerfiles } = await context.supabase
      .from("perfiles")
      .select("id, nombre, edad, documento")
      .in("id", ids)
      .order("nombre");
    if (errorPerfiles) throw new Error("No se pudieron leer los pacientes compartidos.");

    return perfiles ?? [];
  });

/** Entrega el panel de un paciente únicamente si existe acceso médico activo. */
export const obtenerPanelCompartido = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((entrada: unknown) => z.object({ pacienteId: z.string().uuid() }).parse(entrada))
  .handler(async ({ data, context }): Promise<PanelPaciente> => {
    const { data: rol } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "medico").maybeSingle();
    if (!rol) throw new Error("Este espacio está disponible para profesionales médicos.");
    const { data: acceso, error } = await context.supabase
      .from("accesos_medicos")
      .select("id")
      .eq("paciente_id", data.pacienteId)
      .eq("doctor_id", context.userId)
      .eq("estado", "activo")
      .maybeSingle();
    if (error || !acceso) throw new Error("No tiene acceso a este paciente.");

    const { obtenerPanelReal } = await import("./examenes.server");
    return obtenerPanelReal(context.supabase, data.pacienteId);
  });