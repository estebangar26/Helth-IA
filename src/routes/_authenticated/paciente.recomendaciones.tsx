/** FRONTEND · Orientación generada para el examen más reciente. */

import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { FileUp } from "lucide-react";

import { AvisoMedico } from "@/components/copiloto/AvisoMedico";
import { AlimentacionResultados } from "@/components/copiloto/AlimentacionResultados";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/paciente/recomendaciones")({
  head: () => ({ meta: [
    { title: "Alimentación recomendada · HelthIA" },
    { name: "description", content: "Orientación de apoyo basada en los exámenes registrados por el paciente." },
    { property: "og:title", content: "Alimentación recomendada · HelthIA" },
    { property: "og:description", content: "Orientación privada que no sustituye el criterio médico." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PantallaRecomendaciones,
});

function PantallaRecomendaciones() {
  const panel = getRouteApi("/_authenticated/paciente").useLoaderData();

  if (panel.examenes.length === 0) {
    return (
      <main className="rounded-lg border border-dashed border-clinical-border bg-panel p-8 text-center">
        <h1 className="font-display text-xl font-bold text-ink">Aún no hay alimentación recomendada</h1>
        <p className="mx-auto mt-2 max-w-lg font-body text-sm leading-relaxed text-ink-dim">Registre un examen para generar orientación basada en los valores identificados.</p>
        <Button asChild className="mt-5"><Link to="/paciente/examenes"><FileUp aria-hidden="true" /> Registrar examen</Link></Button>
        <div className="mx-auto mt-6 max-w-2xl text-left"><AvisoMedico /></div>
      </main>
    );
  }

  return <main className="space-y-6"><AlimentacionResultados resultados={panel.resultados} /></main>;
}