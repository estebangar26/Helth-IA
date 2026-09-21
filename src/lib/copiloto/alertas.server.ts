/**
 * BACKEND · ALERTAS AL MÉDICO TRATANTE
 * ------------------------------------
 * Módulo de servidor (sufijo `.server`, nunca llega al navegador).
 * Compara los valores del examen recién guardado con los rangos de referencia
 * y, si hay alteraciones, deja registrada una alerta para cada médico con
 * acceso e intenta enviarla por correo.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import { MARCADORES, leerMarcador, type LecturaMarcador } from "./marcadores";

/** Resultado de revisar un examen frente a los rangos de referencia. */
export interface RevisionAlerta {
  nivel: LecturaMarcador;
  titular: string;
  detalle: string;
  hallazgos: string[];
}

/** Revisa todas las columnas del examen y arma el resumen de alteraciones. */
export function revisarAlteraciones(fila: Record<string, unknown>): RevisionAlerta | null {
  const hallazgos: string[] = [];
  let nivel: LecturaMarcador = "ok";

  for (const def of MARCADORES) {
    const crudo = fila[def.campo];
    if (crudo == null) continue;
    const valor = Number(crudo);
    if (!Number.isFinite(valor)) continue;

    const lectura = leerMarcador(def, valor);
    if (lectura === "ok") continue;
    if (lectura === "alert") nivel = "alert";
    else if (nivel === "ok") nivel = "warn";

    const fuera = def.max != null && valor > def.max ? "por encima" : "por debajo";
    hallazgos.push(
      `${def.etiqueta}: ${valor} ${def.unidad}`.trim() +
        ` · ${fuera} del rango esperado${lectura === "alert" ? " (hallazgo severo)" : ""}`,
    );
  }

  // La presión arterial se evalúa como par.
  const sistolica = Number(fila["presion_sistolica"] ?? NaN);
  const diastolica = Number(fila["presion_diastolica"] ?? NaN);
  if (Number.isFinite(sistolica) && Number.isFinite(diastolica)) {
    if (sistolica >= 160 || diastolica >= 100) {
      nivel = "alert";
      hallazgos.push(`Presión arterial: ${sistolica}/${diastolica} mmHg · muy por encima de la meta 130/80`);
    } else if (sistolica >= 140 || diastolica >= 90) {
      if (nivel === "ok") nivel = "warn";
      hallazgos.push(`Presión arterial: ${sistolica}/${diastolica} mmHg · por encima de la meta 130/80`);
    }
  }

  if (hallazgos.length === 0) return null;

  return {
    nivel,
    titular:
      nivel === "alert"
        ? `${hallazgos.length} valor(es) alterado(s), al menos uno severo`
        : `${hallazgos.length} valor(es) fuera del rango esperado`,
    detalle: hallazgos.join("\n"),
    hallazgos,
  };
}

/**
 * Registra la alerta para cada médico con acceso vigente e intenta enviarla
 * por correo. Si el envío no está disponible todavía, la alerta queda guardada
 * como pendiente y se mostrará al médico dentro de la aplicación.
 */
export async function notificarMedicos(
  supabase: SupabaseClient,
  pacienteId: string,
  examenId: string,
  nombrePaciente: string,
  revision: RevisionAlerta,
): Promise<{ registradas: number; enviadas: number }> {
  const { data: accesos } = await supabase
    .from("accesos_medicos")
    .select("doctor_email, estado")
    .eq("paciente_id", pacienteId)
    .in("estado", ["activo", "pendiente"]);

  const correos = [...new Set((accesos ?? []).map((a) => String(a.doctor_email).toLowerCase()))];
  if (correos.length === 0) return { registradas: 0, enviadas: 0 };

  const enviadas = 0;
  const filas: Record<string, unknown>[] = [];

  for (const correo of correos) {
    // El envío por correo se conecta aquí en cuanto el proyecto tenga un
    // dominio de correo verificado. Mientras tanto la alerta queda registrada
    // y visible para el médico dentro de la aplicación.
    const estado = "pendiente";
    const motivo: string | null =
      "El envío por correo se activa cuando el dominio de correo del proyecto quede verificado.";



    filas.push({
      paciente_id: pacienteId,
      examen_id: examenId,
      doctor_email: correo,
      nivel: revision.nivel,
      titular: revision.titular,
      detalle: revision.detalle,
      estado_envio: estado,
      motivo_envio: motivo,
    });
  }

  await supabase.from("alertas_medicas").insert(filas);
  return { registradas: filas.length, enviadas };
}
