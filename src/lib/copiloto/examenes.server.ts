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
import { MARCADORES, leerMarcador, textoRango, ETIQUETA_TIPO, type TipoExamen } from "./marcadores";
import { evaluarRiesgo } from "./triage.server";
import type { MedicionesActuales } from "./datos.server";
import { obtenerRecomendaciones } from "./datos.server";

/** Fila tal como está almacenada en la tabla `examenes`. */
export interface FilaExamen extends Record<string, unknown> {
  id: string;
  titulo: string;
  laboratorio: string | null;
  fecha: string; // AAAA-MM-DD
  tipo_examen: string | null;
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

/** Traduce la presión arterial al semáforo clínico. */
function nivelPresion(sistolica: number, diastolica: number): NivelRiesgo {
  if (sistolica >= 160 || diastolica >= 100) return "alert";
  if (sistolica >= 140 || diastolica >= 90) return "warn";
  return "ok";
}

/** Lee un número guardado en la fila (los numéricos llegan como texto). */
function numero(fila: FilaExamen, campo: string): number | null {
  const crudo = fila[campo];
  if (crudo == null) return null;
  const n = Number(crudo);
  return Number.isFinite(n) ? n : null;
}

const SEVERIDAD: NivelRiesgo[] = ["ok", "warn", "alert"];

/** Convierte una fila de la base de datos en una tarjeta de la línea de tiempo. */
function filaAExamen(fila: FilaExamen): Examen {
  const valores: ValorExamen[] = [];
  let nivel: NivelRiesgo = "ok";
  const subir = (candidato: NivelRiesgo) => {
    if (SEVERIDAD.indexOf(candidato) > SEVERIDAD.indexOf(nivel)) nivel = candidato;
  };

  for (const def of MARCADORES) {
    const valor = numero(fila, def.campo);
    if (valor == null) continue;
    const lectura = leerMarcador(def, valor);
    subir(lectura);
    valores.push({
      etiqueta: def.etiqueta,
      valor: `${valor}${def.unidad ? ` ${def.unidad}` : ""}`,
      ...(lectura === "ok" ? {} : { resaltado: lectura }),
    });
  }

  const sistolica = numero(fila, "presion_sistolica");
  const diastolica = numero(fila, "presion_diastolica");
  if (sistolica != null && diastolica != null) {
    const lectura = nivelPresion(sistolica, diastolica);
    subir(lectura);
    valores.push({
      etiqueta: "Presión",
      valor: `${sistolica}/${diastolica}`,
      ...(lectura === "ok" ? {} : { resaltado: lectura }),
    });
  }

  const tipo = (fila.tipo_examen ?? "general") as TipoExamen;
  const etiquetaTipo = ETIQUETA_TIPO[tipo] ?? ETIQUETA_TIPO.general;

  return {
    id: fila.id,
    titulo: fila.laboratorio
      ? `${fila.titulo} · ${fila.laboratorio} · ${etiquetaTipo}`
      : `${fila.titulo} · ${etiquetaTipo}`,
    fecha: formatearFecha(fila.fecha),
    nivel,
    valores,
  };
}

/** Arma las tarjetas de biomarcadores comparando el último examen con el anterior. */
function construirBiomarcadores(filas: FilaExamen[]): Biomarcador[] {
  if (filas.length === 0) return [];
  const tarjetas: Biomarcador[] = [];

  /** Texto de tendencia frente al registro anterior del mismo marcador. */
  const tendencia = (campo: string, actual: number, unidad: string) => {
    for (const fila of filas.slice(1)) {
      const anterior = numero(fila, campo);
      if (anterior == null) continue;
      const delta = Number((actual - anterior).toFixed(2));
      if (delta === 0) return "Sin cambio";
      return `${delta > 0 ? "Sube" : "Baja"} ${Math.abs(delta)}${unidad ? ` ${unidad}` : ""}`;
    }
    return "Primer registro";
  };

  for (const def of MARCADORES) {
    // Se toma el valor más reciente disponible de cada marcador.
    const indice = filas.findIndex((fila) => numero(fila, def.campo) != null);
    if (indice === -1) continue;
    const valor = numero(filas[indice]!, def.campo)!;
    tarjetas.push({
      nombre: def.etiqueta,
      valor: String(valor),
      ...(def.unidad ? { unidad: def.unidad } : {}),
      nota: `${tendencia(def.campo, valor, def.unidad)} · ${textoRango(def)}`,
      nivel: leerMarcador(def, valor),
    });
  }

  const conPresion = filas.find(
    (fila) => numero(fila, "presion_sistolica") != null && numero(fila, "presion_diastolica") != null,
  );
  if (conPresion) {
    const sistolica = numero(conPresion, "presion_sistolica")!;
    const diastolica = numero(conPresion, "presion_diastolica")!;
    tarjetas.push({
      nombre: "Presión arterial",
      valor: `${sistolica}/${diastolica}`,
      nota: "Meta < 130/80 mmHg",
      nivel: nivelPresion(sistolica, diastolica),
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
      .select("*")
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
    glucemiaAyunas: ultimo ? (numero(ultimo, "glucemia_ayunas") ?? 0) : 0,
    hba1c: ultimo ? (numero(ultimo, "hba1c") ?? 0) : 0,
    presionSistolica: ultimo ? (numero(ultimo, "presion_sistolica") ?? 0) : 0,
    presionDiastolica: ultimo ? (numero(ultimo, "presion_diastolica") ?? 0) : 0,
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
