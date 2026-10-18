/**
 * FRONTEND · Navegación de las páginas públicas.
 * Mantiene el acceso al área clínica separado del contenido informativo.
 */
import { Link } from "@tanstack/react-router";
import { Activity, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NavegacionPublica() {
  return (
    <header className="relative z-20 border-b border-clinical-border/80 bg-panel/92 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="HelthIA, inicio">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Activity className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-display text-sm font-bold text-ink">HelthIA</span>
            <span className="block font-body text-[10px] font-semibold uppercase text-ink-dim">Información clínica conectada</span>
          </span>
        </Link>

        <nav className="order-3 flex w-full flex-wrap items-center gap-1 border-t border-clinical-border pt-2 lg:order-none lg:w-auto lg:border-0 lg:pt-0" aria-label="Navegación principal">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-md px-3 py-2 font-body text-sm font-medium text-ink-dim transition-colors hover:bg-secondary hover:text-ink"
            activeProps={{ className: "bg-secondary text-primary" }}
          >
            Inicio
          </Link>
          <Link
            to="/servicios"
            className="rounded-md px-3 py-2 font-body text-sm font-medium text-ink-dim transition-colors hover:bg-secondary hover:text-ink"
            activeProps={{ className: "bg-secondary text-primary" }}
          >
            Servicios
          </Link>
          <Link
            to="/tienda"
            className="rounded-md px-3 py-2 font-body text-sm font-medium text-ink-dim transition-colors hover:bg-secondary hover:text-ink"
            activeProps={{ className: "bg-secondary text-primary" }}
          >
            Tienda
          </Link>
          <Link
            to="/paciente"
            className="rounded-md px-3 py-2 font-body text-sm font-medium text-ink-dim transition-colors hover:bg-secondary hover:text-ink"
            activeProps={{ className: "bg-secondary text-primary" }}
          >
            Paciente
          </Link>
          <Link
            to="/medico"
            className="rounded-md px-3 py-2 font-body text-sm font-medium text-ink-dim transition-colors hover:bg-secondary hover:text-ink"
            activeProps={{ className: "bg-secondary text-primary" }}
          >
            Médico
          </Link>
          <Link
            to="/dispositivos"
            className="rounded-md px-3 py-2 font-body text-sm font-medium text-ink-dim transition-colors hover:bg-secondary hover:text-ink"
            activeProps={{ className: "bg-secondary text-primary" }}
          >
            Conecta tus dispositivos de IoTM
          </Link>
        </nav>

        <Button asChild size="sm">
          <Link to="/paciente">Mi panel <ArrowRight aria-hidden="true" /></Link>
        </Button>
      </div>
    </header>
  );
}