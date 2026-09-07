/**
 * FRONTEND · Encabezado con la identidad del proyecto y el paciente activo.
 * Solo presenta datos que recibe por props; no consulta al servidor.
 */

import type { ReactNode } from "react";

import type { Paciente } from "@/lib/copiloto/tipos";

/**
 * `accion` permite que cada pantalla decida el botón de la derecha
 * (subir examen y salir en el panel real, ingresar en la vista de ejemplo).
 */
export function Encabezado({
  paciente,
  accion,
}: {
  paciente: Paciente;
  accion?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
      {/* Identidad del sistema + datos del paciente */}
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-[min(1vw,10px)] bg-accent-teal/15 ring-1 ring-accent-teal/20">
          <span className="font-display font-bold text-accent-teal">CS</span>
        </div>
        <div>
          <h1 className="font-display text-xl leading-tight font-semibold text-balance text-ink">
            Copiloto de Salud
          </h1>
          <p className="mt-0.5 font-body text-sm text-ink-dim">
            {paciente.nombre} · {paciente.edad} años · {paciente.documento}
          </p>
        </div>
      </div>

      {/* Fecha de corte y acción principal */}
      <div className="flex items-center gap-3">
        <span className="hidden font-display text-sm text-ink-dim sm:inline">
          Actualizado {paciente.actualizado}
        </span>
        {accion}
      </div>
    </header>
  );
}
