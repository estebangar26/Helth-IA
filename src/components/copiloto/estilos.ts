/**
 * FRONTEND · TRADUCCIÓN DE NIVELES A ESTILOS
 * ------------------------------------------
 * El backend solo dice "ok / warn / alert". Aquí se decide cómo se ve cada
 * nivel, usando siempre los tokens del sistema de diseño (nunca colores fijos).
 */

import type { NivelRiesgo } from "@/lib/copiloto/tipos";

/** Etiqueta visible del semáforo de triage. */
export const textoNivel: Record<NivelRiesgo, string> = {
  ok: "Controlado",
  warn: "En observación",
  alert: "Requiere acción",
};

/** Color del punto indicador. */
export const puntoNivel: Record<NivelRiesgo, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  alert: "bg-alert",
};

/** Estilo de la etiqueta (chip) de estado de un examen. */
export const chipNivel: Record<NivelRiesgo, string> = {
  ok: "text-ok bg-ok/10 ring-ok/20",
  warn: "text-warn bg-warn/10 ring-warn/20",
  alert: "text-alert bg-alert/10 ring-alert/20",
};

/** Color de texto para un valor resaltado. */
export const textoNivelColor: Record<NivelRiesgo, string> = {
  ok: "text-ok",
  warn: "text-warn",
  alert: "text-alert",
};

/**
 * La línea de tiempo pierde intensidad hacia el pasado: el examen más reciente
 * se ve nítido y los anteriores se atenúan.
 */
export type Intensidad = "alta" | "media" | "baja";

export function intensidadPorPosicion(indice: number): Intensidad {
  if (indice === 0) return "alta";
  if (indice === 1) return "media";
  return "baja";
}

export const tarjetaIntensidad: Record<Intensidad, string> = {
  alta: "opacity-100",
  media: "opacity-85",
  baja: "opacity-70",
};

export const textoIntensidad: Record<Intensidad, string> = {
  alta: "text-ink",
  media: "text-ink/80",
  baja: "text-ink/70",
};

export const puntoIntensidad: Record<Intensidad, string> = {
  alta: "bg-brand-blue",
  media: "bg-brand-lime",
  baja: "bg-ink-dim/40",
};
