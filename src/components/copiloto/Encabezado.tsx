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
    <header className="mb-6 flex flex-col gap-5 rounded-lg border border-clinical-border bg-panel p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
      {/* Identidad del sistema + datos del paciente */}
      <div className="flex items-center gap-3">
        <div className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-blue/10 ring-1 ring-brand-blue/20">
          <span className="font-body text-lg font-bold text-brand-blue">CS</span>
        </div>
        <div>
          <h1 className="font-display text-xl leading-tight font-bold text-balance text-ink sm:text-2xl">
            Copiloto de Salud
          </h1>
          <p className="mt-1 font-body text-sm text-ink-dim">
            {paciente.nombre} <span aria-hidden="true">·</span> {paciente.edad} años <span aria-hidden="true">·</span> ID {paciente.documento}
          </p>
        </div>
      </div>

      {/* Fecha de corte y acción principal */}
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <span className="font-body text-xs text-ink-dim">
          Actualizado {paciente.actualizado}
        </span>
        {accion}
      </div>
    </header>
  );
}
