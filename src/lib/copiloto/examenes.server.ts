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
  ResultadoCatalogo,
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

/** Fecha y hora exacta en hora de Colombia, o null si no existe. */
function formatearHora(valor: unknown): string | null {
  if (typeof valor !== "string" || isNaN(Date.parse(valor))) return null;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "medium", timeZone: "America/Bogota" }).format(new Date(valor));
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
    validado: formatearHora(fila["validado_en"]),
    cargado: formatearHora(fila["created_at"]),
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
    // El grupo (tipo de examen) sale de la fila que aportó el valor.
    const tipoFila = (filas[indice]!.tipo_examen ?? "general") as TipoExamen;
    tarjetas.push({
      nombre: def.etiqueta,
      valor: String(valor),
      ...(def.unidad ? { unidad: def.unidad } : {}),
      nota: `${tendencia(def.campo, valor, def.unidad)} · ${textoRango(def)}`,
      nivel: leerMarcador(def, valor),
      grupo: ETIQUETA_TIPO[tipoFila] ?? ETIQUETA_TIPO.general,
    });
  }

  const conPresion = filas.find(
    (fila) => numero(fila, "presion_sistolica") != null && numero(fila, "presion_diastolica") != null,
  );
  if (conPresion) {
    const sistolica = numero(conPresion, "presion_sistolica")!;
    const diastolica = numero(conPresion, "presion_diastolica")!;
    const tipoPresion = (conPresion.tipo_examen ?? "general") as TipoExamen;
    tarjetas.push({
      nombre: "Presión arterial",
      valor: `${sistolica}/${diastolica}`,
      nota: "Meta < 130/80 mmHg",
      nivel: nivelPresion(sistolica, diastolica),
      grupo: ETIQUETA_TIPO[tipoPresion] ?? ETIQUETA_TIPO.general,
    });
  }

  return tarjetas;
}

/** Fila de la tabla hija `resultados_biomarcador` (catálogo ampliado). */
interface FilaResultado {
  examen_id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  valor: number | string;
  unidad: string | null;
  referencia_texto: string | null;
}

/**
 * Arma la vista del catálogo ampliado: un resultado por variable con su
 * historial real (ordenado de más antiguo a más reciente). No inventa datos:
 * solo aparecen las variables que tienen valores guardados.
 */
function construirResultadosCatalogo(
  filas: FilaExamen[],
  resultados: FilaResultado[],
): ResultadoCatalogo[] {
  const fechaPorExamen = new Map(filas.map((f) => [f.id, f.fecha]));
  const porCodigo = new Map<string, ResultadoCatalogo>();

  // Se ordena por fecha del examen (ascendente) para construir el historial.
  const ordenados = [...resultados].sort((a, b) =>
    (fechaPorExamen.get(a.examen_id) ?? "").localeCompare(fechaPorExamen.get(b.examen_id) ?? ""),
  );

  for (const r of ordenados) {
    const valor = Number(r.valor);
    if (!Number.isFinite(valor)) continue;
    const fecha = formatearFecha(fechaPorExamen.get(r.examen_id) ?? "");
    const actual = porCodigo.get(r.codigo);
    if (actual) {
      actual.valor = valor;
      actual.fecha = fecha;
      actual.examenId = r.examen_id;
      if (r.referencia_texto) actual.referencia = r.referencia_texto;
      actual.historial.push({ fecha, valor });
    } else {
      porCodigo.set(r.codigo, {
        codigo: r.codigo,
        nombre: r.nombre,
        categoria: r.categoria,
        valor,
        unidad: r.unidad,
        referencia: r.referencia_texto,
        fecha,
        examenId: r.examen_id,
        historial: [{ fecha, valor }],
      });
    }
  }

  return [...porCodigo.values()];
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
    supabase.from("perfiles").select("nombre, edad, documento, tipo_atencion, eps_nombre, medico_familia, medico_tratante").eq("id", userId).maybeSingle(),
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
    // Última carga real a la plataforma (día y hora de Colombia).
    actualizado: examenes.length
      ? new Date(examenes.reduce((m, e) => (String(e["created_at"]) > m ? String(e["created_at"]) : m), "")).toLocaleString("es-CO", { timeZone: "America/Bogota", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
      : "sin exámenes",
    tipoAtencion: perfil?.tipo_atencion === "eps" ? "eps" : "privado",
    epsNombre: perfil?.eps_nombre ?? null,
    medicoFamilia: perfil?.medico_familia ?? null,
    medicoTratante: perfil?.medico_tratante ?? null,
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
          "Registre su primer examen de laboratorio para que HelthIA pueda clasificar su riesgo y explicarle el resultado.",
        reglasAplicadas: [],
      };

  return {
    paciente,
    evaluacion,
    biomarcadores: construirBiomarcadores(examenes),
    // La línea muestra primero lo último que se cargó a la plataforma.
    examenes: [...examenes].sort((a, b) => String(b["created_at"]).localeCompare(String(a["created_at"]))).map(filaAExamen),
    recomendaciones: ultimo ? (Array.isArray(ultimo["recomendaciones"]) && (ultimo["recomendaciones"] as string[]).length ? (ultimo["recomendaciones"] as string[]) : obtenerRecomendaciones()) : [],
  };
}
