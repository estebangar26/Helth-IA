/** FRONTEND · Panel clínico de solo lectura para la doctora. */

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import { Biomarcadores } from "@/components/copiloto/Biomarcadores";
import { Encabezado } from "@/components/copiloto/Encabezado";
import { Fondo } from "@/components/copiloto/Fondo";
import { LineaExamenes } from "@/components/copiloto/LineaExamenes";
import { PanelRiesgo } from "@/components/copiloto/PanelRiesgo";
import { ResultadosCatalogo } from "@/components/copiloto/ResultadosCatalogo";
import { AvisoMedico } from "@/components/copiloto/AvisoMedico";
import { obtenerPanelCompartido } from "@/lib/copiloto/accesos.functions";

export const Route = createFileRoute("/_authenticated/medico/$pacienteId")({
  loader: ({ params }) => obtenerPanelCompartido({ data: { pacienteId: params.pacienteId } }),
  head: () => ({
    meta: [
      { title: "Vista clínica · HelthIA" },
      { name: "description", content: "Exámenes y riesgo compartidos con acceso médico de solo lectura." },
      { property: "og:title", content: "Vista clínica · HelthIA" },
      { property: "og:description", content: "Consulta privada de resultados clínicos compartidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="font-display text-lg font-bold text-ink">Acceso no disponible</p>
      <p className="mt-2 font-body text-sm text-ink-dim">{(error as Error).message}</p>
      <Link to="/medico" className="mt-4 inline-block font-body text-sm font-semibold text-brand-blue hover:underline">Volver a pacientes</Link>
    </div>
  ),
  component: PanelMedico,
});

function PanelMedico() {
  const panel = Route.useLoaderData();
  return (
    <>
      <Fondo />
      <div className="mx-auto min-h-screen max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link to="/medico" className="mb-4 inline-flex items-center gap-2 font-body text-sm font-semibold text-brand-blue hover:underline"><ArrowLeft className="size-4" aria-hidden="true" /> Pacientes compartidos</Link>
        <Encabezado paciente={panel.paciente} accion={<span className="inline-flex items-center gap-2 rounded-md bg-brand-lime/15 px-3 py-2 font-body text-xs font-semibold text-ink"><LockKeyhole className="size-4 text-brand-lime" aria-hidden="true" /> Solo lectura</span>} />
        <main className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {panel.biomarcadores.length > 0 && <Biomarcadores biomarcadores={panel.biomarcadores} />}
            <ResultadosCatalogo resultados={panel.resultados} />
            {panel.examenes.length > 0 ? <LineaExamenes examenes={panel.examenes} /> : <p className="rounded-lg border border-dashed border-clinical-border bg-panel p-6 font-body text-sm text-ink-dim">Este paciente todavía no tiene exámenes registrados.</p>}
          </div>
          <div className="space-y-6">
            <PanelRiesgo evaluacion={panel.evaluacion} />
            <div className="rounded-lg border border-clinical-border bg-panel p-4"><AvisoMedico /></div>
            <div className="rounded-lg border border-clinical-border bg-panel p-4">
              <p className="font-body text-xs font-semibold text-brand-blue">Acceso autorizado por el paciente</p>
              <p className="mt-1 font-body text-xs leading-relaxed text-ink-dim">Esta vista no permite cambiar ni borrar información clínica.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}