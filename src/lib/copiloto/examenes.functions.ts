/**
 * BACKEND · API INTERNA DE EXÁMENES DEL PACIENTE
 * ----------------------------------------------
 * Cada función se ejecuta en el servidor y exige sesión activa
 * (`requireSupabaseAuth`), de modo que un paciente solo puede leer y escribir
 * sus propios exámenes. El frontend nunca habla directo con la base de datos.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PanelPaciente } from "./tipos";

/** Validación del formulario de carga de un examen. */
const esquemaExamen = z.object({
  titulo: z.string().trim().min(3, "Escriba el nombre del examen").max(120),
  laboratorio: z.string().trim().max(120).optional().or(z.literal("")),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  glucemiaAyunas: z.number().min(20).max(800).nullable(),
  hba1c: z.number().min(3).max(20).nullable(),
  presionSistolica: z.number().int().min(60).max(260).nullable(),
  presionDiastolica: z.number().int().min(30).max(180).nullable(),
  creatinina: z.number().min(0.1).max(20).nullable(),
  notas: z.string().trim().max(500).optional().or(z.literal("")),
});

export type EntradaExamen = z.infer<typeof esquemaExamen>;

/** Panel completo del paciente autenticado (perfil + triage + línea de tiempo). */
export const obtenerMiPanel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PanelPaciente> => {
    const { data: rol } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "paciente").maybeSingle();
    if (!rol) throw new Error("Este espacio está disponible para pacientes.");
    const { obtenerPanelReal } = await import("./examenes.server");
    return obtenerPanelReal(context.supabase, context.userId);
  });

/** Guarda un examen nuevo del paciente autenticado. */
export const crearExamen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((entrada: unknown) => esquemaExamen.parse(entrada))
  .handler(async ({ data, context }): Promise<{ ok: true; id: string }> => {
    const { data: rol } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "paciente").maybeSingle();
    if (!rol) throw new Error("Solo los pacientes pueden registrar exámenes.");
    const { error, data: fila } = await context.supabase
      .from("examenes")
      .insert({
        user_id: context.userId,
        titulo: data.titulo,
        laboratorio: data.laboratorio ? data.laboratorio : null,
        fecha: data.fecha,
        glucemia_ayunas: data.glucemiaAyunas,
        hba1c: data.hba1c,
        presion_sistolica: data.presionSistolica,
        presion_diastolica: data.presionDiastolica,
        creatinina: data.creatinina,
        notas: data.notas ? data.notas : null,
      })
      .select("id")
      .single();

    if (error || !fila) throw new Error("No se pudo guardar el examen.");
    return { ok: true, id: fila.id };
  });

/** Validación del archivo que sube el paciente (PDF o imagen del laboratorio). */
const esquemaArchivo = z.object({
  nombre: z.string().trim().min(1).max(200),
  mime: z.enum(["application/pdf", "image/jpeg", "image/png", "image/webp"]),
  // Base64 sin el prefijo `data:`; ~13.4 MB de base64 ≈ 10 MB de archivo.
  contenido: z.string().min(100).max(14_000_000),
});

/**
 * Lee un examen desde el archivo que subió el paciente (PDF o foto), extrae los
 * valores con el modelo multimodal y lo guarda en su historia. El paciente no
 * escribe ningún dato a mano.
 */
export const analizarYGuardarExamen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((entrada: unknown) => esquemaArchivo.parse(entrada))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ ok: true; id: string; alertasRegistradas: number }> => {
      const { data: rol } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "paciente").maybeSingle();
      if (!rol) throw new Error("Solo los pacientes pueden subir exámenes.");
      // Validación de identidad: sin documento validado no se cargan exámenes.
      const { data: perfilDoc } = await context.supabase.from("perfiles").select("documento_validado_en").eq("id", context.userId).maybeSingle();
      if (!perfilDoc?.documento_validado_en) throw new Error("Registre su documento de identidad en la pestaña "Mi perfil" antes de subir exámenes.");
      const { analizarArchivoExamen } = await import("./analisis.server");
      const extraido = await analizarArchivoExamen(data.contenido, data.mime, data.nombre);

      const conValor = Object.values(extraido.valores).some((v) => v != null);
      if (!conValor) {
        throw new Error(
          "No encontramos resultados de laboratorio legibles en el archivo. Suba el documento completo o una foto más nítida.",
        );
      }

      // Riesgo por reglas fijas; la IA solo redacta orientación nutricional (una vez por examen).
      const { evaluarRiesgo } = await import("./triage.server");
      const { generarRecomendaciones } = await import("./recomendaciones.server");
      const v = extraido.valores;
      const riesgo = evaluarRiesgo({ glucemiaAyunas: v["glucemia_ayunas"] ?? 0, hba1c: v["hba1c"] ?? 0, presionSistolica: v["presion_sistolica"] ?? 0, presionDiastolica: v["presion_diastolica"] ?? 0 });
      const { data: perfilEdad } = await context.supabase.from("perfiles").select("edad").eq("id", context.userId).maybeSingle();
      const recomendaciones = await generarRecomendaciones(v, `${riesgo.nivel}: ${riesgo.titular}`, perfilEdad?.edad ?? null);

      const { error, data: fila } = await context.supabase
        .from("examenes")
        .insert({
          user_id: context.userId,
          recomendaciones,
          titulo: extraido.titulo ?? "Examen de laboratorio",
          laboratorio: extraido.laboratorio,
          fecha: extraido.fecha ?? new Date().toISOString().slice(0, 10),
          validado_en: extraido.validadoEn,
          tipo_examen: extraido.tipoExamen,
          notas: extraido.notas,
          ...extraido.valores,
        })
        .select("id")
        .single();

      if (error || !fila) throw new Error("No se pudo guardar el examen analizado.");

      // Revisa los valores y avisa a los médicos autorizados si hay alteraciones.
      const { revisarAlteraciones, notificarMedicos } = await import("./alertas.server");
      const revision = revisarAlteraciones(extraido.valores);
      let alertasRegistradas = 0;

      if (revision) {
        const { data: perfil } = await context.supabase
          .from("perfiles")
          .select("nombre")
          .eq("id", context.userId)
          .maybeSingle();

        const resultado = await notificarMedicos(
          context.supabase,
          context.userId,
          fila.id,
          perfil?.nombre ?? "Paciente",
          revision,
        );
        alertasRegistradas = resultado.registradas;
      }

      return { ok: true, id: fila.id, alertasRegistradas };
    },
  );

/** Borra un examen propio (por si se registró con datos equivocados). */
export const borrarExamen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((entrada: unknown) => z.object({ id: z.string().uuid() }).parse(entrada))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { data: rol } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "paciente").maybeSingle();
    if (!rol) throw new Error("Solo los pacientes pueden eliminar exámenes.");
    const { error } = await context.supabase.from("examenes").delete().eq("id", data.id);
    if (error) throw new Error("No se pudo eliminar el examen.");
    return { ok: true };
  });

/** Datos básicos del paciente que se muestran en el encabezado. */
export const guardarPerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((entrada: unknown) =>
    z
      .object({
        nombre: z.string().trim().min(2).max(120),
        edad: z.number().int().min(0).max(120).nullable(),
        // CC/TI/CE: 5-12 dígitos; pasaporte: 5-12 letras o números.
        documento: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{5,12}$/, "Documento inválido: use solo números o letras (5 a 12 caracteres)."),
        tipoAtencion: z.enum(["eps", "privado"]),
        epsNombre: z.string().trim().max(120).optional().or(z.literal("")),
        medicoFamilia: z.string().trim().max(120).optional().or(z.literal("")),
        medicoTratante: z.string().trim().max(120).optional().or(z.literal("")),
      })
      .parse(entrada),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { data: rol } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "paciente").maybeSingle();
    if (!rol) throw new Error("Este perfil está disponible para pacientes.");
    const { data: actual } = await context.supabase.from("perfiles").select("documento, documento_validado_en").eq("id", context.userId).maybeSingle();
    const mismoDoc = actual?.documento?.toUpperCase() === data.documento && actual?.documento_validado_en;
    const { error } = await context.supabase.from("perfiles").upsert({
      id: context.userId,
      nombre: data.nombre,
      edad: data.edad,
      documento: data.documento,
      documento_validado_en: mismoDoc ? actual!.documento_validado_en : new Date().toISOString(),
      tipo_atencion: data.tipoAtencion,
      eps_nombre: data.tipoAtencion === "eps" && data.epsNombre ? data.epsNombre : null,
      medico_familia: data.tipoAtencion === "eps" && data.medicoFamilia ? data.medicoFamilia : null,
      medico_tratante: data.tipoAtencion === "privado" && data.medicoTratante ? data.medicoTratante : null,
    });
    if (error?.code === "23505") throw new Error("Este documento ya está registrado en otra cuenta.");
    if (error) throw new Error("No se pudo guardar el perfil.");
    return { ok: true };
  });
