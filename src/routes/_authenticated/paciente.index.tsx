/**
 * FRONTEND · Panel del paciente con sus exámenes reales (ruta "/paciente")
 * ---------------------------------------------------------------------
 * Solo se ve con sesión activa. Pide los datos al backend y permite registrar
 * un examen nuevo; al guardarlo, la línea de tiempo se actualiza sola.
 */

import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { ArrowRight, FileUp, HeartPulse, Lightbulb } from "lucide-react";

import { CompartirConDoctora } from "@/components/copiloto/CompartirConDoctora";
import { PanelRiesgo } from "@/components/copiloto/PanelRiesgo";
import { CarruselMensajes } from "@/components/copiloto/CarruselMensajes";
import { EnfermedadesCubiertas } from "@/components/copiloto/EnfermedadesCubiertas";
import { PerfilAtencion } from "@/components/copiloto/PerfilAtencion";

export const Route = createFileRoute("/_authenticated/paciente/")({
  head: () => ({
    meta: [
      { title: "Mi espacio · HelthIA" },
      {
        name: "description",
        content:
          "Registre sus exámenes de laboratorio y vea su riesgo, sus biomarcadores y su línea de tiempo clínica.",
      },
      { property: "og:title", content: "Mi espacio de paciente · HelthIA" },
      {
        property: "og:description",
        content: "Exámenes propios, biomarcadores y clasificación de riesgo explicable.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="font-display text-lg font-semibold text-ink">No pudimos cargar sus datos</p>
      <p className="mt-2 font-body text-sm text-ink-dim">{(error as Error).message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-16 text-center font-body text-ink-dim">
      No encontramos esta información.
    </div>
  ),
  component: MiPanel,
});

function MiPanel() {
  const panel = getRouteApi("/_authenticated/paciente").useLoaderData();

  const accesos = [
    { to: "/paciente/examenes", titulo: "Registrar exámenes", texto: "Suba un PDF o una foto y consulte su historial.", icono: FileUp },
    { to: "/paciente/resultados", titulo: "Ver resultados", texto: "Revise biomarcadores y reglas de riesgo aplicadas.", icono: HeartPulse },
    { to: "/paciente/recomendaciones", titulo: "Mis recomendaciones", texto: "Consulte la orientación generada para su último examen.", icono: Lightbulb },
  ] as const;

  return (
    <main className="space-y-6">
      <CarruselMensajes />
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Accesos principales">
        {accesos.map(({ to, titulo, texto, icono: Icono }) => (
          <Link key={to} to={to} className="group rounded-lg border border-clinical-border bg-panel p-5 shadow-sm transition-colors hover:border-brand-blue">
            <Icono className="size-6 text-brand-blue" aria-hidden="true" />
            <h2 className="mt-4 font-display text-base font-bold text-ink">{titulo}</h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-dim">{texto}</p>
            <span className="mt-4 inline-flex items-center gap-2 font-body text-xs font-semibold text-brand-blue">Abrir <ArrowRight className="size-4" aria-hidden="true" /></span>
          </Link>
        ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <PanelRiesgo evaluacion={panel.evaluacion} />
        <div className="space-y-6"><PerfilAtencion paciente={panel.paciente} /><CompartirConDoctora /></div>
      </div>
      <EnfermedadesCubiertas />
    </main>
  );
}
