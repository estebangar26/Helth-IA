/** FRONTEND · Resultados clínicos explicables del paciente. */

import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { Biomarcadores } from "@/components/copiloto/Biomarcadores";
import { PanelRiesgo } from "@/components/copiloto/PanelRiesgo";

export const Route = createFileRoute("/_authenticated/paciente/resultados")({
  head: () => ({ meta: [
    { title: "Mis resultados · HelthIA" },
    { name: "description", content: "Biomarcadores recientes y clasificación de riesgo explicable." },
    { property: "og:title", content: "Mis resultados · HelthIA" },
    { property: "og:description", content: "Resultados privados y reglas de riesgo aplicadas." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Resultados,
});

function Resultados() {
  const panel = getRouteApi("/_authenticated/paciente").useLoaderData();

  return (
    <main className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      {panel.biomarcadores.length > 0 ? (
        <Biomarcadores biomarcadores={panel.biomarcadores} />
      ) : (
        <p className="rounded-lg border border-dashed border-clinical-border bg-panel p-6 font-body text-sm text-ink-dim">
          Las variables fisiológicas aparecerán cuando registre su primer examen.
        </p>
      )}
      <PanelRiesgo evaluacion={panel.evaluacion} />
    </main>
  );
}