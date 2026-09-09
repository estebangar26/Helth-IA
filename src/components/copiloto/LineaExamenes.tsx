/**
 * FRONTEND · Línea de tiempo única con el historial de exámenes.
 * Es la columna vertebral de la pantalla: cada tarjeta es un examen, ordenado
 * del más reciente al más antiguo, con su clasificación de riesgo.
 */

import type { Examen } from "@/lib/copiloto/tipos";
import {
  chipNivel,
  intensidadPorPosicion,
  puntoIntensidad,
  textoIntensidad,
  textoNivel,
  textoNivelColor,
} from "./estilos";

export function LineaExamenes({ examenes }: { examenes: Examen[] }) {
  return (
    <section className="rounded-lg border border-clinical-border bg-panel p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <p className="font-body text-xs font-semibold uppercase text-brand-blue">Historial longitudinal</p>
        <h2 className="mt-1 font-display text-lg font-bold text-ink">Línea cronológica de exámenes</h2>
      </div>

      <div className="relative pl-6">
        {/* Eje vertical de la línea de tiempo */}
        <div className="absolute top-1 bottom-1 left-[7px] w-px bg-clinical-border" />

        {examenes.map((examen, indice) => {
          // Los exámenes antiguos se atenúan para dar sensación de profundidad.
          const intensidad = intensidadPorPosicion(indice);

          return (
            <div
              key={examen.id}
              className={`relative rounded-md border border-clinical-border bg-panel-soft p-4 ${
                indice < examenes.length - 1 ? "mb-5" : ""
              }`}
            >
              {/* Nodo sobre el eje */}
              <span
                className={`absolute top-5 -left-6 size-3 rounded-full ring-4 ring-panel ${puntoIntensidad[intensidad]}`}
              />

              <div className="flex items-start justify-between gap-3">
                <div>
                    <p className={`font-body font-semibold ${textoIntensidad[intensidad]}`}>
                    {examen.titulo}
                  </p>
                  <p className="mt-0.5 font-body text-sm text-ink-dim">{examen.fecha}</p>
                </div>
                <span
                    className={`shrink-0 rounded px-2 py-1 font-body text-[10px] font-semibold uppercase ring-1 ${chipNivel[examen.nivel]}`}
                >
                  {textoNivel[examen.nivel]}
                </span>
              </div>

              {/* Valores del examen; los relevantes se resaltan por nivel */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {examen.valores.map((valor) => (
                  <div key={valor.etiqueta}>
                    <p className="font-body text-[10px] uppercase text-ink-dim">
                      {valor.etiqueta}
                    </p>
                    <p
                      className={`font-body font-semibold ${
                        valor.resaltado
                          ? textoNivelColor[valor.resaltado]
                          : textoIntensidad[intensidad]
                      }`}
                    >
                      {valor.valor}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
