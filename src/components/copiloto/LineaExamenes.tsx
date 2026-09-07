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
  tarjetaIntensidad,
  textoIntensidad,
  textoNivel,
  textoNivelColor,
} from "./estilos";

export function LineaExamenes({ examenes }: { examenes: Examen[] }) {
  return (
    <>
      <p className="mb-4 font-display text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-dim">
        Línea de exámenes
      </p>

      <div className="relative pl-6">
        {/* Eje vertical de la línea de tiempo */}
        <div className="absolute top-1 bottom-1 left-[7px] w-px bg-gradient-to-b from-accent-teal/40 via-white/15 to-accent-teal/10" />

        {examenes.map((examen, indice) => {
          // Los exámenes antiguos se atenúan para dar sensación de profundidad.
          const intensidad = intensidadPorPosicion(indice);

          return (
            <div
              key={examen.id}
              className={`relative rounded-[min(1.5vw,14px)] p-4 ring-1 backdrop-blur-xl ${tarjetaIntensidad[intensidad]} ${
                indice < examenes.length - 1 ? "mb-5" : ""
              }`}
            >
              {/* Nodo sobre el eje */}
              <span
                className={`absolute top-5 -left-6 size-3 rounded-full ring-4 ring-surface ${puntoIntensidad[intensidad]}`}
              />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`font-display font-semibold ${textoIntensidad[intensidad]}`}>
                    {examen.titulo}
                  </p>
                  <p className="mt-0.5 font-body text-sm text-ink-dim">{examen.fecha}</p>
                </div>
                <span
                  className={`shrink-0 rounded-[min(1vw,6px)] px-2 py-1 font-display text-[11px] font-semibold tracking-[0.08em] uppercase ring-1 ${chipNivel[examen.nivel]}`}
                >
                  {textoNivel[examen.nivel]}
                </span>
              </div>

              {/* Valores del examen; los relevantes se resaltan por nivel */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {examen.valores.map((valor) => (
                  <div key={valor.etiqueta}>
                    <p className="font-display text-[10px] tracking-[0.08em] uppercase text-ink-dim">
                      {valor.etiqueta}
                    </p>
                    <p
                      className={`font-display font-semibold ${
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
    </>
  );
}
