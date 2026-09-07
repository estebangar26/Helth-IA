/**
 * FRONTEND · Tarjetas con los tres biomarcadores clave del paciente.
 * El color del punto y de la nota depende del nivel que envía el backend.
 */

import type { Biomarcador } from "@/lib/copiloto/tipos";
import { puntoNivel } from "./estilos";

export function Biomarcadores({ biomarcadores }: { biomarcadores: Biomarcador[] }) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {biomarcadores.map((b) => (
        <div
          key={b.nombre}
          className="rounded-[min(1.5vw,14px)] bg-white/[0.05] p-4 ring-1 ring-white/10 backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-dim">
              {b.nombre}
            </span>
            <span className={`size-2 shrink-0 rounded-full ${puntoNivel[b.nivel]}`} />
          </div>

          {/* Valor medido; la unidad se muestra más pequeña cuando existe */}
          <p className="font-display text-3xl leading-none font-bold text-ink">
            {b.valor}
            {b.unidad ? <span className="text-base font-medium text-ink-dim"> {b.unidad}</span> : null}
          </p>

          <p
            className={`mt-2 font-body text-sm ${
              b.nivel === "warn"
                ? "text-warn/90"
                : b.nivel === "alert"
                  ? "text-alert/90"
                  : "text-ink-dim"
            }`}
          >
            {b.nota}
          </p>
        </div>
      ))}
    </div>
  );
}
