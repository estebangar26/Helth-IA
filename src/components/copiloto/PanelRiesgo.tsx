/**
 * FRONTEND · Panel lateral con el resultado del motor de reglas.
 * Muestra el nivel de riesgo, su explicación, el semáforo de referencia y
 * las reglas que se activaron (transparencia de la decisión).
 */

import type { EvaluacionRiesgo, NivelRiesgo } from "@/lib/copiloto/tipos";
import { puntoNivel, textoNivel, textoNivelColor } from "./estilos";

const niveles: NivelRiesgo[] = ["ok", "warn", "alert"];

export function PanelRiesgo({ evaluacion }: { evaluacion: EvaluacionRiesgo }) {
  return (
    <aside className="self-start">
      <div className="rounded-lg border border-clinical-border bg-panel p-5 shadow-sm">
        <p className="mb-4 font-body text-xs font-semibold uppercase text-brand-blue">
          Estado de riesgo
        </p>

        {/* Nivel actual devuelto por el backend */}
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`grid size-11 shrink-0 place-items-center rounded-full ring-2 ${
              evaluacion.nivel === "alert"
                ? "bg-alert/20 ring-alert/40"
                : evaluacion.nivel === "warn"
                  ? "bg-warn/20 ring-warn/40"
                  : "bg-ok/20 ring-ok/40"
            }`}
          >
            <span className={`size-4 rounded-full ${puntoNivel[evaluacion.nivel]}`} />
          </div>
          <div>
            <p
              className={`font-body text-lg leading-none font-bold ${textoNivelColor[evaluacion.nivel]}`}
            >
              {textoNivel[evaluacion.nivel]}
            </p>
            <p className="mt-1 font-body text-sm text-ink-dim">{evaluacion.titular}</p>
          </div>
        </div>

        {/* Explicación en lenguaje claro para el paciente */}
        <p className="mb-5 font-body text-sm leading-relaxed text-pretty text-ink">
          {evaluacion.explicacion}
        </p>

        {/* Leyenda del semáforo */}
        <div className="space-y-2">
          {niveles.map((nivel) => (
            <div key={nivel} className="flex items-center gap-2 text-sm">
              <span className={`size-2.5 shrink-0 rounded-full ${puntoNivel[nivel]}`} />
              <span className="font-body text-ink-dim">{textoNivel[nivel]}</span>
            </div>
          ))}
        </div>

        {/* Reglas activadas: hacen auditable la clasificación */}
        {evaluacion.reglasAplicadas.length > 0 && (
          <div className="mt-5 border-t border-clinical-border pt-4">
            <p className="mb-2 font-body text-[10px] font-semibold uppercase text-ink-dim">
              Reglas aplicadas
            </p>
            <ul className="space-y-1.5 font-body text-xs leading-relaxed text-ink/70">
              {evaluacion.reglasAplicadas.map((regla) => (
                <li key={regla}>{regla}</li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </aside>
  );
}
