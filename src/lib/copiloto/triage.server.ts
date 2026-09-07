/**
 * BACKEND · MOTOR DE REGLAS DE TRIAGE (determinístico y explicable)
 * -----------------------------------------------------------------
 * Aquí NO interviene la inteligencia artificial: la clasificación de riesgo se
 * hace con umbrales clínicos fijos, de forma que toda decisión pueda auditarse
 * y explicarse al paciente. Cada regla deja registro en `reglasAplicadas`.
 */

import type { EvaluacionRiesgo, NivelRiesgo } from "./tipos";
import type { MedicionesActuales } from "./datos.server";

/** Umbrales clínicos usados por las reglas (diabetes tipo 2). */
const METAS = {
  hba1cMeta: 7.0,
  hba1cAlta: 8.5,
  glucemiaMeta: 110,
  glucemiaAlta: 180,
  sistolicaMeta: 130,
  diastolicaMeta: 80,
} as const;

/** Devuelve el nivel más severo entre dos niveles. */
function nivelMasSevero(a: NivelRiesgo, b: NivelRiesgo): NivelRiesgo {
  const orden: NivelRiesgo[] = ["ok", "warn", "alert"];
  return orden.indexOf(a) >= orden.indexOf(b) ? a : b;
}

/**
 * Evalúa las mediciones y devuelve nivel de riesgo, titular, explicación
 * en lenguaje claro y la lista de reglas que se activaron.
 */
export function evaluarRiesgo(m: MedicionesActuales): EvaluacionRiesgo {
  let nivel: NivelRiesgo = "ok";
  const reglasAplicadas: string[] = [];
  const hallazgos: string[] = [];
  let titular = "Todos los valores en meta";

  // R-01 · Hemoglobina glicosilada por encima de la meta.
  if (m.hba1c >= METAS.hba1cAlta) {
    nivel = nivelMasSevero(nivel, "alert");
    reglasAplicadas.push(`R-01: HbA1c ${m.hba1c}% ≥ ${METAS.hba1cAlta}% → requiere acción`);
    titular = "HbA1c muy por encima de la meta";
    hallazgos.push(`Su HbA1c de ${m.hba1c}% está muy por encima del objetivo de ${METAS.hba1cMeta}%.`);
  } else if (m.hba1c > METAS.hba1cMeta) {
    nivel = nivelMasSevero(nivel, "warn");
    reglasAplicadas.push(`R-02: HbA1c ${m.hba1c}% > ${METAS.hba1cMeta}% → en observación`);
    titular = "HbA1c sobre la meta";
    hallazgos.push(`Su HbA1c de ${m.hba1c}% supera el objetivo de ${METAS.hba1cMeta}%.`);
  }

  // R-03 · Glucemia en ayunas.
  if (m.glucemiaAyunas >= METAS.glucemiaAlta) {
    nivel = nivelMasSevero(nivel, "alert");
    reglasAplicadas.push(
      `R-03: glucemia ${m.glucemiaAyunas} mg/dL ≥ ${METAS.glucemiaAlta} → requiere acción`,
    );
    hallazgos.push(`La glucemia en ayunas de ${m.glucemiaAyunas} mg/dL está elevada.`);
  } else if (m.glucemiaAyunas > METAS.glucemiaMeta) {
    nivel = nivelMasSevero(nivel, "warn");
    reglasAplicadas.push(
      `R-04: glucemia ${m.glucemiaAyunas} mg/dL > ${METAS.glucemiaMeta} → en observación`,
    );
    hallazgos.push(`La glucemia en ayunas de ${m.glucemiaAyunas} mg/dL está algo alta.`);
  } else {
    hallazgos.push("La glucemia en ayunas se mantiene estable.");
  }

  // R-05 · Presión arterial fuera de meta.
  if (m.presionSistolica > METAS.sistolicaMeta || m.presionDiastolica > METAS.diastolicaMeta) {
    nivel = nivelMasSevero(nivel, "warn");
    reglasAplicadas.push(
      `R-05: presión ${m.presionSistolica}/${m.presionDiastolica} mmHg fuera de meta ${METAS.sistolicaMeta}/${METAS.diastolicaMeta} → en observación`,
    );
    hallazgos.push("La presión arterial requiere revisión en la próxima consulta.");
  }

  return {
    nivel,
    titular,
    explicacion: hallazgos.join(" "),
    reglasAplicadas,
  };
}
