/**
 * BACKEND · LECTURA Y ESCRITURA DE EXÁMENES REALES
 * ------------------------------------------------
 * Módulo de servidor (sufijo `.server`, nunca llega al navegador).
 * Convierte las filas guardadas en la base de datos al contrato que consume
 * el frontend (`PanelPaciente`) y aplica el motor de reglas de triage.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Biomarcador,
  Examen,
  NivelRiesgo,
  Paciente,
  PanelPaciente,
  ValorExamen,
} from "./tipos";
import { evaluarRiesgo } from "./triage.server";
import type { MedicionesActuales } from "./datos.server";
import { obtenerRecomendaciones } from "./datos.server";

/** Fila tal como está almacenada en la tabla `examenes`. */
export interface FilaExamen {
  id: string;
  titulo: string;
  laboratorio: string | null;
  fecha: string; // AAAA-MM-DD
  glucemia_ayunas: number | null;
  hba1c: number | null;
  presion_sistolica: number | null;
  presion_diastolica: number | null;
  creatinina: number | null;
  notas: string | null;
}

/** Fecha legible en español a partir de una fecha ISO (sin zonas horarias). */
function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.split("-").map(Number);
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${dia} de ${meses[(mes ?? 1) - 1]} de ${anio}`;
}

/** Fecha corta usada en el encabezado ("12 mar 2025"). */
function formatearFechaCorta(iso: string): string {
  const [anio, mes, dia] = iso.split("-").map(Number);
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${dia} ${meses[(mes ?? 1) - 1]} ${anio}`;
}

/** Traduce un valor de HbA1c al semáforo clínico. */
function nivelHba1c(valor: number): NivelRiesgo {
  if (valor >= 8.5) return "alert";
  if (valor > 7.0) return "warn";
  return "ok";
}

/** Traduce una glucemia en ayunas al semáforo clínico. */
function nivelGlucemia(valor: number): NivelRiesgo {
  if (valor >= 180) return "alert";
  if (valor > 110) return "warn";
  return "ok";
}

/** Traduce la presión arterial al semáforo clínico. */
function nivelPresion(sistolica: number, diastolica: number): NivelRiesgo {
  if (sistolica >= 160 || diastolica >= 100) return "alert";
  if (sistolica >= 130 || diastolica >= 80) return "warn";
  return "ok";
}

/** Convierte una fila de la base de datos en una tarjeta de la línea de tiempo. */
function filaAExamen(fila: FilaExamen): Examen {
  const valores: ValorExamen[] = [];
  let nivel: NivelRiesgo = "ok";
  const severidad: NivelRiesgo[] = ["ok", "warn", "alert"];
  const subir = (candidato: NivelRiesgo) => {
    if (severidad.indexOf(candidato) > severidad.indexOf(nivel)) nivel = candidato;
  };

  if (fila.glucemia_ayunas != null) {
    const n = nivelGlucemia(Number(fila.glucemia_ayunas));
    subir(n);
    valores.push({ etiqueta: "Glucemia", valor: `${fila.glucemia_ayunas} mg/dL`, resaltado: n });
  }
  if (fila.hba1c != null) {
    const n = nivelHba1c(Number(fila.hba1c));
    subir(n);
    valores.push({ etiqueta: "HbA1c", valor: `${fila.hba1c} %`, resaltado: n });
  }
  if (fila.presion_sistolica != null && fila.presion_diastolica != null) {
    const n = nivelPresion(fila.presion_sistolica, fila.presion_diastolica);
    subir(n);
    valores.push({
      etiqueta: "Presión",
      valor: `${fila.presion_sistolica}/${fila.presion_diastolica}`,
      resaltado: n,
    });
  }
  if (fila.creatinina != null) {
    valores.push({ etiqueta: "Creatinina", valor: `${fila.creatinina} mg/dL` });
  }

  return {
    id: fila.id,
    titulo: fila.laboratorio ? `${fila.titulo} · ${fila.laboratorio}` : fila.titulo,
    fecha: formatearFecha(fila.fecha),
    nivel,
    valores,
  };
}

/** Arma las tarjetas de biomarcadores comparando el último examen con el anterior. */
function construirBiomarcadores(filas: FilaExamen[]): Biomarcador[] {
  const ultimo = filas[0];
  const previo = filas[1];
  if (!ultimo) return [];

  const tarjetas: Biomarcador[] = [];

  /** Texto de tendencia frente al examen anterior. */
  const tendencia = (actual: number, anterior: number | null | undefined, sufijo: string) => {
    if (anterior == null) return "Primer registro";
    const delta = Number((actual - Number(anterior)).toFixed(1));
    if (delta === 0) return "Sin cambio";
    return `${delta > 0 ? "Sube" : "Baja"} ${Math.abs(delta)}${sufijo}`;
  };

  if (ultimo.glucemia_ayunas != null) {
    const valor = Number(ultimo.glucemia_ayunas);
    tarjetas.push({
      nombre: "Glucemia ayunas",
      valor: String(valor),
      unidad: "mg/dL",
      nota: `${tendencia(valor, previo?.glucemia_ayunas, " mg/dL")} · objetivo < 110`,
      nivel: nivelGlucemia(valor),
    });
  }
  if (ultimo.hba1c != null) {
    const valor = Number(ultimo.hba1c);
    tarjetas.push({
      nombre: "HbA1c",
      valor: String(valor),
      unidad: "%",
      nota: `${tendencia(valor, previo?.hba1c, "%")} · meta < 7.0%`,
      nivel: nivelHba1c(valor),
    });
  }
  if (ultimo.presion_sistolica != null && ultimo.presion_diastolica != null) {
    tarjetas.push({
      nombre: "Presión arterial",
      valor: `${ultimo.presion_sistolica}/${ultimo.presion_diastolica}`,
      nota: "Meta < 130/80",
      nivel: nivelPresion(ultimo.presion_sistolica, ultimo.presion_diastolica),
    });
  }

  return tarjetas;
}

/**
 * Consulta el perfil y los exámenes del usuario autenticado y devuelve el panel
 * completo. Recibe el cliente ya autenticado, por lo que las reglas de la base
 * de datos garantizan que solo se lean los datos de ese paciente.
 */
export async function obtenerPanelReal(
  supabase: SupabaseClient,
  userId: string,
): Promise<PanelPaciente> {
  const [{ data: perfil }, { data: filas, error }] = await Promise.all([
    supabase.from("perfiles").select("nombre, edad, documento").eq("id", userId).maybeSingle(),
    supabase
      .from("examenes")
      .select(
        "id, titulo, laboratorio, fecha, glucemia_ayunas, hba1c, presion_sistolica, presion_diastolica, creatinina, notas",
      )
      .eq("user_id", userId)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (error) throw new Error("No se pudieron leer los exámenes.");

  const examenes = (filas ?? []) as FilaExamen[];
  const ultimo = examenes[0];

  const paciente: Paciente = {
    nombre: perfil?.nombre ?? "Paciente",
    edad: perfil?.edad ?? 0,
    documento: perfil?.documento ?? "Sin documento registrado",
    actualizado: ultimo ? formatearFechaCorta(ultimo.fecha) : "sin exámenes",
  };

  // Mediciones crudas del examen más reciente para el motor de reglas.
  const mediciones: MedicionesActuales = {
    glucemiaAyunas: Number(ultimo?.glucemia_ayunas ?? 0),
    hba1c: Number(ultimo?.hba1c ?? 0),
    presionSistolica: ultimo?.presion_sistolica ?? 0,
    presionDiastolica: ultimo?.presion_diastolica ?? 0,
  };

  const evaluacion = ultimo
    ? evaluarRiesgo(mediciones)
    : {
        nivel: "ok" as NivelRiesgo,
        titular: "Aún no hay exámenes",
        explicacion:
          "Registre su primer examen de laboratorio para que el copiloto pueda clasificar su riesgo y explicarle el resultado.",
        reglasAplicadas: [],
      };

  return {
    paciente,
    evaluacion,
    biomarcadores: construirBiomarcadores(examenes),
    examenes: examenes.map(filaAExamen),
    recomendaciones: ultimo ? obtenerRecomendaciones() : [],
  };
}
