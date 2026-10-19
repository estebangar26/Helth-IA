// ============= Full file contents =============

/**
 * FRONTEND · Variables fisiológicas agrupadas por tipo de examen
 * (testosterona, biomarcadores de cáncer, diabetes, etc.).
 * El color del punto y de la nota depende del nivel que envía el backend.
 */

import type { Biomarcador } from "@/lib/copiloto/tipos";
import { chipNivel, textoNivel } from "./estilos";

const codigos: Record<string, string> = {
  HbA1c: "LOINC 4548-4",
  "Glucemia ayunas": "LOINC 1558-6",
  "Presión arterial": "LOINC 85354-9",
};

/** Agrupa las tarjetas conservando el orden en que llegan del backend. */
function agruparPorTipoExamen(biomarcadores: Biomarcador[]) {
  const grupos = new Map<string, Biomarcador[]>();
  for (const b of biomarcadores) {
    const titulo = b.grupo ?? "Otras mediciones";
    const lista = grupos.get(titulo) ?? [];
    lista.push(b);
    grupos.set(titulo, lista);
  }
  return [...grupos.entries()].map(([titulo, tarjetas]) => ({ titulo, tarjetas }));
}

export function Biomarcadores({ biomarcadores }: { biomarcadores: Biomarcador[] }) {
  const grupos = agruparPorTipoExamen(biomarcadores);

  return (
    <section className="rounded-lg border border-clinical-border bg-panel p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-body text-xs font-semibold uppercase text-brand-blue">Observaciones clínicas</p>
          <h2 className="mt-1 font-display text-lg font-bold text-ink">Variables fisiológicas</h2>
        </div>
        <span className="rounded border border-clinical-border bg-panel-soft px-2 py-1 font-mono text-[10px] text-ink-dim">Estructura compatible con FHIR</span>
      </div>

      {/* Una subsección por cada tipo de examen que tenga variables registradas */}
      {grupos.map((grupo) => (
        <div key={grupo.titulo} className="mb-6 last:mb-0">
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-ink">
            <span className="h-2 w-2 rounded-full bg-brand-blue" aria-hidden="true" />
            {grupo.titulo}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {grupo.tarjetas.map((b) => (
              <div
                key={`${grupo.titulo}-${b.nombre}`}
                className="rounded-md border border-clinical-border bg-panel-soft p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-body text-xs font-semibold text-ink-dim">
                    {b.nombre}
                  </span>
                  <span className="rounded border border-clinical-border bg-panel px-1.5 py-0.5 font-mono text-[9px] text-ink-dim">{codigos[b.nombre] ?? "OBS"}</span>
                </div>

                {/* Valor medido; la unidad se muestra más pequeña cuando existe */}
                <p className="font-body text-3xl leading-none font-bold text-ink">
                  {b.valor}
                  {b.unidad ? <span className="text-base font-medium text-ink-dim"> {b.unidad}</span> : null}
                </p>

                <div className="mt-3 flex items-start gap-2">
                  <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ring-1 ${chipNivel[b.nivel]}`}>{textoNivel[b.nivel]}</span>
                  <p className="font-body text-xs leading-relaxed text-ink-dim">{b.nota}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
