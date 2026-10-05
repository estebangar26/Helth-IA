/** FRONTEND · Navegación compartida del espacio privado del paciente. */

import { Link } from "@tanstack/react-router";
import {
  ClipboardList,
  FileUp,
  HeartPulse,
  House,
  Lightbulb,
  Pill,
  UserRound,
  Stethoscope,
} from "lucide-react";

import type { Paciente } from "@/lib/copiloto/tipos";

const enlaces = [
  { to: "/paciente", etiqueta: "Inicio", icono: House, exacto: true },
  { to: "/paciente/perfil", etiqueta: "Mi perfil", icono: UserRound, exacto: false },
  { to: "/paciente/examenes", etiqueta: "Exámenes", icono: FileUp, exacto: false },
  { to: "/paciente/resultados", etiqueta: "Resultados", icono: HeartPulse, exacto: false },
  { to: "/paciente/recomendaciones", etiqueta: "Recomendaciones", icono: Lightbulb, exacto: false },
  { to: "/paciente/medicaciones", etiqueta: "Medicaciones", icono: Pill, exacto: false },
] as const;

export function NavegacionPaciente({ paciente }: { paciente: Paciente }) {
  return (
    <nav aria-label="Secciones del paciente" className="min-w-0 max-w-full overflow-hidden rounded-lg border border-clinical-border bg-panel p-2 shadow-sm lg:sticky lg:top-6 lg:self-start">
      <p className="hidden px-3 pb-2 pt-1 font-body text-[10px] font-semibold uppercase text-ink-dim lg:block">
        Mi espacio
      </p>
      <div className="flex gap-1 overflow-x-auto lg:flex-col">
        {enlaces.map(({ to, etiqueta, icono: Icono, exacto }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: exacto }}
            className="flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 font-body text-sm font-medium text-ink-dim transition-colors hover:bg-panel-soft hover:text-brand-blue"
            activeProps={{ className: "bg-brand-blue text-primary-foreground hover:bg-brand-blue hover:text-primary-foreground" }}
          >
            <Icono aria-hidden="true" className="size-4" />
            {etiqueta}
          </Link>
        ))}
        {paciente.tipoAtencion === "privado" && (
          <Link
            to="/paciente/especialistas"
            className="flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 font-body text-sm font-medium text-ink-dim transition-colors hover:bg-panel-soft hover:text-brand-blue"
            activeProps={{ className: "bg-brand-blue text-primary-foreground hover:bg-brand-blue hover:text-primary-foreground" }}
          >
            <Stethoscope aria-hidden="true" className="size-4" />
            Especialistas
          </Link>
        )}
      </div>
      <div className="mt-2 hidden border-t border-clinical-border px-3 pt-3 lg:block">
        <p className="flex items-center gap-2 font-body text-xs text-ink-dim">
          <ClipboardList aria-hidden="true" className="size-4 text-brand-lime" />
          Información clínica privada
        </p>
      </div>
    </nav>
  );
}